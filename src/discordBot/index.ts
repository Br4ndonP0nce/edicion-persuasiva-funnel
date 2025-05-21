import { 
  Client, 
  GatewayIntentBits, 
  TextChannel, 
  MessageReaction, 
  User, 
  Message,
  Events,
  PartialMessageReaction,
  PartialUser,
  MessageReactionEventDetails
} from 'discord.js';
import { 
  doc, 
  setDoc, 
  updateDoc, 
  increment, 
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

// Discord client setup with proper intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ]
});

// Constants
const HALL_OF_FAME_CHANNEL_ID = process.env.DISCORD_HALL_OF_FAME_CHANNEL_ID as string;
const VIDEO_SUBMISSION_REGEX = /(https?:\/\/[^\s]+\.(mp4|avi|mov|wmv|flv|webm|youtube\.com\/watch\?v=|youtu\.be\/|vimeo\.com\/|streamable\.com\/|twitch\.tv\/videos\/)[^\s]*)/i;
const VOTE_EMOJI = '👍';

// Get the current week number
function getCurrentWeekNumber(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 604800000;
  return Math.floor(diff / oneWeek) + 1;
}

// Get the current week's start and end date
function getCurrentWeekRange(): { start: Date, end: Date } {
  const now = new Date();
  const day = now.getDay(); // 0 is Sunday, 1 is Monday, etc.
  
  // Calculate the date of the previous Monday (or today if it's a Monday)
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  monday.setHours(0, 0, 0, 0);
  
  // Calculate the date of the upcoming Sunday (or today if it's a Sunday)
  const sunday = new Date(now);
  sunday.setDate(now.getDate() + (day === 0 ? 0 : 7 - day));
  sunday.setHours(23, 59, 59, 999);
  
  return { start: monday, end: sunday };
}

// Extract platform information from a video URL
function extractPlatformInfo(videoUrl: string): { platform: string; videoId: string } {
  let platformInfo = {
    platform: 'unknown',
    videoId: ''
  };
  
  if (videoUrl.includes('youtube.com/watch?v=')) {
    platformInfo.platform = 'youtube';
    const match = videoUrl.match(/v=([^&]+)/);
    platformInfo.videoId = match ? match[1] : '';
  } else if (videoUrl.includes('youtu.be/')) {
    platformInfo.platform = 'youtube';
    const match = videoUrl.match(/youtu\.be\/([^?&]+)/);
    platformInfo.videoId = match ? match[1] : '';
  } else if (videoUrl.includes('vimeo.com/')) {
    platformInfo.platform = 'vimeo';
    const match = videoUrl.match(/vimeo\.com\/(\d+)/);
    platformInfo.videoId = match ? match[1] : '';
  } else if (videoUrl.includes('instagram.com/')) {
    platformInfo.platform = 'instagram';
    // Extract post ID from Instagram URL
    const match = videoUrl.match(/instagram\.com\/(?:p|reel)\/([^/?&]+)/);
    platformInfo.videoId = match ? match[1] : '';
  } else if (videoUrl.includes('facebook.com/')) {
    platformInfo.platform = 'facebook';
    // Try to extract video ID from Facebook URL
    const match = videoUrl.match(/(?:videos|watch)(?:\/|\?v=)(\d+)/);
    platformInfo.videoId = match ? match[1] : '';
  }
  
  return platformInfo;
}

// Listen for message events
client.on(Events.MessageCreate, async (message: Message) => {
  // Ignore bot messages
  if (message.author.bot) return;
  
  // Check if message contains a video URL
  const videoMatch = message.content.match(VIDEO_SUBMISSION_REGEX);
  if (videoMatch && videoMatch[0]) {
    try {
      const videoUrl = videoMatch[0];
      
      // Get the Hall of Fame channel
      const hallOfFameChannel = client.channels.cache.get(HALL_OF_FAME_CHANNEL_ID);
      if (!hallOfFameChannel || !(hallOfFameChannel instanceof TextChannel)) {
        console.error('Hall of Fame channel not found or not a text channel');
        return;
      }
      
      // Post the video to the hall of fame channel for voting
      const submissionMessage = await hallOfFameChannel.send({
        content: `**New Video Submission by ${message.author.username}**\n${videoUrl}\n\nReact with ${VOTE_EMOJI} to vote!`
      });
      
      // Add initial reaction
      await submissionMessage.react(VOTE_EMOJI);
      
      // Extract video platform and ID
      const platformInfo = extractPlatformInfo(videoUrl);
      
      // Get the current week details
      const weekNumber = getCurrentWeekNumber();
      const weekRange = getCurrentWeekRange();
      
      // Store submission in Firebase
      const submissionId = submissionMessage.id;
      await setDoc(doc(db, 'hallOfFame_submissions', submissionId), {
        videoUrl,
        platform: platformInfo.platform,
        videoId: platformInfo.videoId,
        authorId: message.author.id,
        authorUsername: message.author.username,
        authorAvatar: message.author.displayAvatarURL(),
        timestamp: new Date().toISOString(),
        votes: 0,
        weekNumber,
        weekStart: weekRange.start.toISOString(),
        weekEnd: weekRange.end.toISOString()
      });
      
      // Check if user exists in the users collection, if not create them
      const userRef = doc(db, 'hallOfFame_users', message.author.id);
      await setDoc(userRef, {
        id: message.author.id,
        username: message.author.username,
        avatar: message.author.displayAvatarURL(),
        totalVotes: 0,
        totalSubmissions: increment(1),
        weeklyVotes: {},
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      // Reply to the user
      await message.reply(`Your video has been submitted to the Hall of Fame! Check it out in <#${HALL_OF_FAME_CHANNEL_ID}>`);
      
    } catch (error) {
      console.error('Error processing video submission:', error);
      await message.reply('There was an error processing your submission. Please try again later.');
    }
  }
});

// Listen for reaction add events
client.on(Events.MessageReactionAdd, async (
  reaction: MessageReaction | PartialMessageReaction, 
  user: User | PartialUser,
  _details: MessageReactionEventDetails
) => {
  // Ignore bot reactions
  if (user.bot) return;
  
  // Since we received a partial object, we need to fetch the complete object
  try {
    if (reaction.partial) {
      await reaction.fetch();
    }
    
    // Check if reaction is in the Hall of Fame channel and the correct emoji
    if (reaction.message.channel.id === HALL_OF_FAME_CHANNEL_ID && 
        reaction.emoji.name === VOTE_EMOJI) {
      
      const submissionId = reaction.message.id;
      
      // Update vote count in Firebase
      const submissionRef = doc(db, 'hallOfFame_submissions', submissionId);
      await updateDoc(submissionRef, {
        votes: increment(1)
      });
      
      // Get author info from the submission
      const submissionDocs = await getDocs(
        query(collection(db, 'hallOfFame_submissions'), where('__name__', '==', submissionId))
      );
      
      if (!submissionDocs.empty) {
        const submissionData = submissionDocs.docs[0].data();
        const authorId = submissionData.authorId;
        const weekNumber = submissionData.weekNumber;
        
        // Update user's total votes
        if (authorId) {
          const userRef = doc(db, 'hallOfFame_users', authorId);
          await updateDoc(userRef, {
            totalVotes: increment(1),
            [`weeklyVotes.${weekNumber}`]: increment(1),
            updatedAt: new Date().toISOString()
          });
        }
      }
    }
  } catch (error) {
    console.error('Error handling reaction add:', error);
  }
});

// Remove vote when reaction is removed
client.on(Events.MessageReactionRemove, async (
  reaction: MessageReaction | PartialMessageReaction, 
  user: User | PartialUser,
  _details: MessageReactionEventDetails
) => {
  // Ignore bot reactions
  if (user.bot) return;
  
  try {
    // Since we received a partial object, we need to fetch the complete object
    if (reaction.partial) {
      await reaction.fetch();
    }
    
    // Check if reaction is in the Hall of Fame channel and the correct emoji
    if (reaction.message.channel.id === HALL_OF_FAME_CHANNEL_ID && 
        reaction.emoji.name === VOTE_EMOJI) {
      
      const submissionId = reaction.message.id;
      
      // Update vote count in Firebase
      const submissionRef = doc(db, 'hallOfFame_submissions', submissionId);
      await updateDoc(submissionRef, {
        votes: increment(-1)
      });
      
      // Get author info from the submission
      const submissionDocs = await getDocs(
        query(collection(db, 'hallOfFame_submissions'), where('__name__', '==', submissionId))
      );
      
      if (!submissionDocs.empty) {
        const submissionData = submissionDocs.docs[0].data();
        const authorId = submissionData.authorId;
        const weekNumber = submissionData.weekNumber;
        
        // Update user's total votes
        if (authorId) {
          const userRef = doc(db, 'hallOfFame_users', authorId);
          await updateDoc(userRef, {
            totalVotes: increment(-1),
            [`weeklyVotes.${weekNumber}`]: increment(-1),
            updatedAt: new Date().toISOString()
          });
        }
      }
    }
  } catch (error) {
    console.error('Error handling reaction remove:', error);
  }
});

// On Ready
client.once(Events.ClientReady, () => {
  console.log(`Bot is ready! Logged in as ${client.user?.tag}`);
});

// Error handling
client.on(Events.Error, (error) => {
  console.error('Discord client error:', error);
});

// Login to Discord with error handling
async function startBot() {
  try {
    await client.login(process.env.DISCORD_BOT_TOKEN);
    console.log('Discord bot starting...');
  } catch (error) {
    console.error('Failed to start Discord bot:', error);
  }
}

// Only start the bot if not in testing environment
if (process.env.NODE_ENV !== 'test') {
  startBot();
}

export default client;