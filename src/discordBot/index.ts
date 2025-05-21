import { Client, GatewayIntentBits, TextChannel, MessageReaction, User, Message } from 'discord.js';
import { doc, setDoc, updateDoc, increment, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';




// Discord client setup
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

// Listen for message events
client.on('messageCreate', async (message: Message) => {
  // Ignore bot messages
  if (message.author.bot) return;
  
  // Check if message contains a video URL
  const videoMatch = message.content.match(VIDEO_SUBMISSION_REGEX);
  if (videoMatch) {
    const videoUrl = videoMatch[0];
    const submissionChannel = client.channels.cache.get(HALL_OF_FAME_CHANNEL_ID) as TextChannel;
    
    if (submissionChannel) {
      // Post the video to the hall of fame channel for voting
      const submissionMessage = await submissionChannel.send({
        content: `**New Video Submission by ${message.author.username}**\n${videoUrl}\n\nReact with ${VOTE_EMOJI} to vote!`
      });
      
      // Add initial reaction
      await submissionMessage.react(VOTE_EMOJI);
      
      // Extract video platform and ID (for embedded previews)
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
      }
      
      // Get the current week details
      const weekNumber = getCurrentWeekNumber();
      const weekRange = getCurrentWeekRange();
      
      // Store submission in Firebase
      const submissionId = submissionMessage.id;
      await setDoc(doc(db, 'hallOfFame/submissions', submissionId), {
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
      const userRef = doc(db, 'hallOfFame/users', message.author.id);
      await setDoc(userRef, {
        id: message.author.id,
        username: message.author.username,
        avatar: message.author.displayAvatarURL(),
        totalVotes: 0,
        totalSubmissions: increment(1),
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      // Reply to the user
      await message.reply(`Your video has been submitted to the Hall of Fame! Check it out in <#${HALL_OF_FAME_CHANNEL_ID}>`);
    }
  }
});

// Listen for reaction events
client.on('messageReactionAdd', async (reaction: MessageReaction, user: User) => {
  // Ignore bot reactions
  if (user.bot) return;
  
  // Check if reaction is in the Hall of Fame channel
  if (reaction.message.channelId === HALL_OF_FAME_CHANNEL_ID && reaction.emoji.name === VOTE_EMOJI) {
    const submissionId = reaction.message.id;
    
    // Update vote count in Firebase
    const submissionRef = doc(db, 'hallOfFame/submissions', submissionId);
    await updateDoc(submissionRef, {
      votes: increment(1)
    });
    
    // Get author info from the submission
    const submissionDocs = await getDocs(
      query(collection(db, 'hallOfFame/submissions'), where('__name__', '==', submissionId))
    );
    
    if (!submissionDocs.empty) {
      const submissionData = submissionDocs.docs[0].data();
      const authorId = submissionData.authorId;
      const weekNumber = submissionData.weekNumber;
      
      // Update user's total votes
      const userRef = doc(db, 'hallOfFame/users', authorId);
      await updateDoc(userRef, {
        totalVotes: increment(1),
        [`weeklyVotes.${weekNumber}`]: increment(1),
        updatedAt: new Date().toISOString()
      });
    }
  }
});

// Remove vote when reaction is removed
client.on('messageReactionRemove', async (reaction: MessageReaction, user: User) => {
  // Ignore bot reactions
  if (user.bot) return;
  
  // Check if reaction is in the Hall of Fame channel
  if (reaction.message.channelId === HALL_OF_FAME_CHANNEL_ID && reaction.emoji.name === VOTE_EMOJI) {
    const submissionId = reaction.message.id;
    
    // Update vote count in Firebase
    const submissionRef = doc(db, 'hallOfFame/submissions', submissionId);
    await updateDoc(submissionRef, {
      votes: increment(-1)
    });
    
    // Get author info from the submission
    const submissionDocs = await getDocs(
      query(collection(db, 'hallOfFame/submissions'), where('__name__', '==', submissionId))
    );
    
    if (!submissionDocs.empty) {
      const submissionData = submissionDocs.docs[0].data();
      const authorId = submissionData.authorId;
      const weekNumber = submissionData.weekNumber;
      
      // Update user's total votes
      const userRef = doc(db, 'hallOfFame/users', authorId);
      await updateDoc(userRef, {
        totalVotes: increment(-1),
        [`weeklyVotes.${weekNumber}`]: increment(-1),
        updatedAt: new Date().toISOString()
      });
    }
  }
});

// On Ready
client.once('ready', () => {
  console.log(`Logged in as ${client.user?.tag}`);
});

// Login to Discord
client.login(process.env.DISCORD_BOT_TOKEN);

export default client;