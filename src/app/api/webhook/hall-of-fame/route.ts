import { NextRequest, NextResponse } from 'next/server';
import { 
  doc, 
  setDoc, 
  updateDoc, 
  increment, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

// Webhook secret for verification
const WEBHOOK_SECRET = process.env.HALL_OF_FAME_WEBHOOK_SECRET;

// Types
interface WinCategory {
  id: 'learning' | 'brand' | 'results' | 'monetization';
  name: string;
  points: number;
}

interface UserProfile {
  discordId: string;
  username: string;
  displayName: string;
  portfolioUrl?: string;
  socialMediaUrl?: string;
  totalPoints: number;
  monthlyPoints: Record<string, number>;
  level: string;
  joinedAt: string;
  lastActive: string;
}

interface WinSubmission {
  submissionId: string;
  userId: string;
  username: string;
  category: 'learning' | 'brand' | 'results' | 'monetization';
  points: number;
  evidenceType: 'image' | 'video' | 'link' | 'drive_file';
  evidenceUrl: string;
  evidencePreview?: string;
  platform?: string;
  fileName?: string;
  fileSize?: number;
  status: 'pending' | 'approved' | 'rejected';
  hallOfFameSelected: boolean;
  monthCycle: string;
  timestamp: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

// Helper functions
function getCurrentMonthCycle(): string {
  return new Date().toISOString().slice(0, 7); // YYYY-MM
}

function getUserLevel(totalPoints: number): string {
  if (totalPoints >= 500) return 'Master Persuasivo';
  if (totalPoints >= 300) return 'Conquistador Visual';
  if (totalPoints >= 200) return 'Influencer';
  if (totalPoints >= 100) return 'Editor en Acción';
  return 'Aprendiz Creativo';
}

function getWinCategories(): Record<string, WinCategory> {
  return {
    'learning': { id: 'learning', name: 'Aprendizaje', points: 10 },
    'brand': { id: 'brand', name: 'Marca Personal', points: 20 },
    'results': { id: 'results', name: 'Resultados', points: 40 },
    'monetization': { id: 'monetization', name: 'Monetización', points: 100 }
  };
}

export async function POST(request: NextRequest) {
  // Verify webhook secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${WEBHOOK_SECRET}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { eventType } = body;
    
    switch (eventType) {
      case 'user_created':
        await handleUserCreated(body);
        break;
        
      case 'win_submission':
        await handleWinSubmission(body);
        break;
        
      case 'admin_review':
        await handleAdminReview(body);
        break;
        
      case 'hall_of_fame_toggle':
        await handleHallOfFameToggle(body);
        break;
        
      // Legacy support for old hall of fame system
      case 'new_submission':
        await handleLegacySubmission(body);
        break;
        
      case 'vote_change':
        await handleLegacyVoteChange(body);
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid event type' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Event handlers

async function handleUserCreated(data: any) {
  const { 
    discordId, 
    username, 
    displayName, 
    portfolioUrl, 
    socialMediaUrl 
  } = data;
  
  console.log('=== USER CREATION START ===');
  console.log(`Creating user with discordId: ${discordId}`);
  console.log(`Username: ${username}`);
  console.log(`Display name: ${displayName}`);
  console.log(`Portfolio URL: ${portfolioUrl}`);
  
  const userProfile: UserProfile = {
    discordId,
    username,
    displayName,
    portfolioUrl: portfolioUrl || '',
    socialMediaUrl: socialMediaUrl || '',
    totalPoints: 0,
    monthlyPoints: {},
    level: getUserLevel(0),
    joinedAt: new Date().toISOString(),
    lastActive: new Date().toISOString()
  };
  
  console.log(`User profile to store: ${JSON.stringify(userProfile, null, 2)}`);
  
  try {
    // Store user profile
    const userRef = doc(db, 'ep_users', discordId);
    await setDoc(userRef, userProfile);
    
    console.log(`✅ User profile stored successfully in ep_users/${discordId}`);
    
    // Verify it was stored
    const verification = await getDoc(userRef);
    console.log(`✅ Verification - User exists: ${verification.exists()}`);
    if (verification.exists()) {
      console.log(`✅ Verified data: ${JSON.stringify(verification.data(), null, 2)}`);
    }
    
    console.log('=== USER CREATION END ===');
  } catch (error) {
    console.error('❌ Error storing user profile:', error);
    throw error;
  }
}

async function handleWinSubmission(data: any) {
  const {
    submissionId,
    userId,
    username,
    category,
    points,
    evidenceType,
    evidenceUrl,
    evidencePreview,
    platform,
    fileName,
    fileSize,
    monthCycle,
    timestamp
  } = data;
  
  // Validate category
  const categories = getWinCategories();
  if (!categories[category]) {
    throw new Error(`Invalid category: ${category}`);
  }
  
  const submission: WinSubmission = {
    submissionId,
    userId,
    username,
    category,
    points: categories[category].points,
    evidenceType,
    evidenceUrl,
    evidencePreview: evidencePreview || '',
    platform: platform || '',
    fileName: fileName || '',
    fileSize: fileSize || 0,
    status: 'pending',
    hallOfFameSelected: false,
    monthCycle: monthCycle || getCurrentMonthCycle(),
    timestamp: timestamp || new Date().toISOString()
  };
  
  // Store submission
  await setDoc(doc(db, 'ep_submissions', submissionId), submission);
  
  // Update user's last active
  const userRef = doc(db, 'ep_users', userId);
  await updateDoc(userRef, {
    lastActive: new Date().toISOString()
  });
  
  console.log(`New ${category} submission from ${username}: ${evidenceUrl}`);
}

async function handleAdminReview(data: any) {
  const {
    submissionId,
    status, // 'approved' | 'rejected'
    reviewedBy,
    rejectionReason
  } = data;
  
  const submissionRef = doc(db, 'ep_submissions', submissionId);
  const submissionSnap = await getDoc(submissionRef);
  
  if (!submissionSnap.exists()) {
    throw new Error(`Submission ${submissionId} not found`);
  }
  
  const submissionData = submissionSnap.data() as WinSubmission;
  
  // Update submission status
  const updateData: any = {
    status,
    reviewedAt: new Date().toISOString(),
    reviewedBy: reviewedBy || 'admin'
  };
  
  if (status === 'rejected' && rejectionReason) {
    updateData.rejectionReason = rejectionReason;
  }
  
  await updateDoc(submissionRef, updateData);
  
  // If approved, award points to user
  if (status === 'approved') {
    const userRef = doc(db, 'ep_users', submissionData.userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data() as UserProfile;
      const newTotalPoints = userData.totalPoints + submissionData.points;
      const newLevel = getUserLevel(newTotalPoints);
      
      // Update user points and level
      await updateDoc(userRef, {
        totalPoints: newTotalPoints,
        level: newLevel,
        [`monthlyPoints.${submissionData.monthCycle}`]: increment(submissionData.points),
        lastActive: new Date().toISOString()
      });
      
      console.log(`Awarded ${submissionData.points} points to ${submissionData.username} (Total: ${newTotalPoints}, Level: ${newLevel})`);
    }
  }
  
  console.log(`Submission ${submissionId} ${status} by ${reviewedBy}`);
}

async function handleHallOfFameToggle(data: any) {
  const { submissionId, hallOfFameSelected, toggledBy } = data;
  
  const submissionRef = doc(db, 'ep_submissions', submissionId);
  
  await updateDoc(submissionRef, {
    hallOfFameSelected: hallOfFameSelected,
    hallOfFameToggledAt: new Date().toISOString(),
    hallOfFameToggledBy: toggledBy || 'admin'
  });
  
  console.log(`Hall of Fame ${hallOfFameSelected ? 'selected' : 'deselected'} for submission ${submissionId}`);
}

// Legacy support for old hall of fame system
async function handleLegacySubmission(data: any) {
  const {
    submissionId,
    authorId,
    authorUsername,
    authorAvatar,
    videoUrl,
    platform,
    videoId,
    weekNumber,
    timestamp
  } = data;
  
  // Convert to new submission format with 'results' category
  const legacySubmission = {
    submissionId,
    userId: authorId,
    username: authorUsername,
    category: 'results',
    points: 40, // Results category points
    evidenceType: 'video',
    evidenceUrl: videoUrl,
    evidencePreview: platform === 'youtube' ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '',
    platform: platform || 'unknown',
    fileName: '',
    fileSize: 0,
    status: 'approved', // Legacy submissions were auto-approved
    hallOfFameSelected: true, // Legacy submissions go to hall of fame
    monthCycle: getCurrentMonthCycle(),
    timestamp: timestamp || new Date().toISOString(),
    reviewedAt: new Date().toISOString(),
    reviewedBy: 'legacy_system',
    // Keep legacy data for compatibility
    legacyData: {
      weekNumber,
      votes: 0
    }
  };
  
  await setDoc(doc(db, 'ep_submissions', submissionId), legacySubmission);
  
  // Also store in legacy collection for backward compatibility
  await setDoc(doc(db, 'hallOfFame_submissions', submissionId), {
    videoUrl,
    platform: platform || 'unknown',
    videoId: videoId || '',
    authorId,
    authorUsername,
    authorAvatar: authorAvatar || '',
    timestamp: timestamp || new Date().toISOString(),
    votes: 0,
    weekNumber,
    weekStart: new Date().toISOString(),
    weekEnd: new Date().toISOString()
  });
  
  // Update/create user profile
  const userRef = doc(db, 'ep_users', authorId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    await updateDoc(userRef, {
      totalPoints: increment(40),
      [`monthlyPoints.${getCurrentMonthCycle()}`]: increment(40),
      lastActive: new Date().toISOString()
    });
  } else {
    // Create basic profile for legacy user
    await setDoc(userRef, {
      discordId: authorId,
      username: authorUsername,
      displayName: authorUsername,
      portfolioUrl: '',
      socialMediaUrl: '',
      totalPoints: 40,
      monthlyPoints: { [getCurrentMonthCycle()]: 40 },
      level: getUserLevel(40),
      joinedAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    });
  }
  
  console.log(`Legacy submission converted: ${authorUsername} - ${videoUrl}`);
}

async function handleLegacyVoteChange(data: any) {
  const { submissionId, votes, voterId } = data;
  
  // Update legacy submission votes
  const legacyRef = doc(db, 'hallOfFame_submissions', submissionId);
  await updateDoc(legacyRef, {
    votes: votes || 0
  });
  
  // Update new submission if exists
  const newSubmissionRef = doc(db, 'ep_submissions', submissionId);
  const newSubmissionSnap = await getDoc(newSubmissionRef);
  
  if (newSubmissionSnap.exists()) {
    await updateDoc(newSubmissionRef, {
      'legacyData.votes': votes || 0
    });
  }
  
  console.log(`Legacy vote updated for submission ${submissionId}: ${votes} votes`);
}

// GET endpoint for fetching data
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  
  console.log(`GET request received - action: ${action}`);
  console.log(`Search params: ${searchParams.toString()}`);
  
  try {
    switch (action) {
      case 'user_profile':
        return await getUserProfile(searchParams);
        
      case 'leaderboard':
        return await getLeaderboard(searchParams);
        
      case 'submissions':
        return await getSubmissions(searchParams);
        
      case 'admin_queue':
        return await getAdminQueue(searchParams);
        
      default:
        console.log(`Invalid action: ${action}`);
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('GET endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getLeaderboard(searchParams: URLSearchParams) {
  const type = searchParams.get('type') || 'monthly'; // 'monthly' | 'alltime'
  const monthCycle = searchParams.get('month') || getCurrentMonthCycle();
  const limitParam = searchParams.get('limit');
  const limitNum = limitParam ? parseInt(limitParam) : 10;
  
  const usersRef = collection(db, 'ep_users');
  let usersQuery;
  
  if (type === 'alltime') {
    usersQuery = query(
      usersRef,
      orderBy('totalPoints', 'desc'),
      limit(limitNum)
    );
  } else {
    // For monthly, we need to fetch all users and sort by monthly points
    usersQuery = query(usersRef);
  }
  
  const snapshot = await getDocs(usersQuery);
  const leaderboard: any[] = [];
  
  snapshot.forEach((doc) => {
    const userData = doc.data() as UserProfile;
    
    if (type === 'monthly') {
      const monthlyPoints = userData.monthlyPoints[monthCycle] || 0;
      if (monthlyPoints > 0) {
        leaderboard.push({
          userId: userData.discordId,
          username: userData.username,
          displayName: userData.displayName,
          portfolioUrl: userData.portfolioUrl,
          points: monthlyPoints,
          level: userData.level,
          rank: 0 // Will be set after sorting
        });
      }
    } else {
      leaderboard.push({
        userId: userData.discordId,
        username: userData.username,
        displayName: userData.displayName,
        portfolioUrl: userData.portfolioUrl,
        points: userData.totalPoints,
        level: userData.level,
        rank: 0
      });
    }
  });
  
  // Sort and assign ranks
  leaderboard.sort((a, b) => b.points - a.points);
  leaderboard.forEach((entry, index) => {
    entry.rank = index + 1;
  });
  
  return NextResponse.json({
    leaderboard: leaderboard.slice(0, limitNum),
    type,
    monthCycle: type === 'monthly' ? monthCycle : undefined
  });
}

async function getSubmissions(searchParams: URLSearchParams) {
  const type = searchParams.get('type') || 'hall_of_fame'; // 'hall_of_fame' | 'recent' | 'user'
  const userId = searchParams.get('userId');
  const monthCycle = searchParams.get('month') || getCurrentMonthCycle();
  const limitParam = searchParams.get('limit');
  const limitNum = limitParam ? parseInt(limitParam) : 10;
  
  const submissionsRef = collection(db, 'ep_submissions');
  let submissionsQuery;
  
  if (type === 'hall_of_fame') {
    submissionsQuery = query(
      submissionsRef,
      where('hallOfFameSelected', '==', true),
      where('status', '==', 'approved'),
      orderBy('timestamp', 'desc'),
      limit(limitNum)
    );
  } else if (type === 'user' && userId) {
    submissionsQuery = query(
      submissionsRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitNum)
    );
  } else {
    submissionsQuery = query(
      submissionsRef,
      where('status', '==', 'approved'),
      where('monthCycle', '==', monthCycle),
      orderBy('timestamp', 'desc'),
      limit(limitNum)
    );
  }
  
  const snapshot = await getDocs(submissionsQuery);
  const submissions: any[] = [];
  
  snapshot.forEach((doc) => {
    const submissionData = doc.data() as WinSubmission;
    submissions.push({
      id: doc.id,
      ...submissionData
    });
  });
  
  return NextResponse.json({ submissions });
}

async function getUserProfile(searchParams: URLSearchParams) {
  const userId = searchParams.get('userId');
  
  console.log(`getUserProfile called with userId: ${userId}`);
  
  if (!userId) {
    console.log('No userId provided');
    return NextResponse.json(
      { error: 'userId required' },
      { status: 400 }
    );
  }
  
  try {
    const userRef = doc(db, 'ep_users', userId);
    const userSnap = await getDoc(userRef);
    
    console.log(`User document exists: ${userSnap.exists()}`);
    
    if (!userSnap.exists()) {
      console.log(`User ${userId} not found in ep_users collection`);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    const userData = userSnap.data() as UserProfile;
    console.log(`User data found: ${JSON.stringify(userData, null, 2)}`);
    
    // Get user's recent submissions
    const submissionsRef = collection(db, 'ep_submissions');
    const userSubmissionsQuery = query(
      submissionsRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(5)
    );
    
    const submissionsSnapshot = await getDocs(userSubmissionsQuery);
    const recentSubmissions: any[] = [];
    
    submissionsSnapshot.forEach((doc) => {
      recentSubmissions.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`Found ${recentSubmissions.length} recent submissions for user`);
    
    return NextResponse.json({
      profile: userData,
      recentSubmissions
    });
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getAdminQueue(searchParams: URLSearchParams) {
  const status = searchParams.get('status') || 'pending';
  const limitParam = searchParams.get('limit');
  const limitNum = limitParam ? parseInt(limitParam) : 50;
  
  const submissionsRef = collection(db, 'ep_submissions');
  const queueQuery = query(
    submissionsRef,
    where('status', '==', status),
    orderBy('timestamp', 'desc'),
    limit(limitNum)
  );
  
  const snapshot = await getDocs(queueQuery);
  const queue: any[] = [];
  
  snapshot.forEach((doc) => {
    queue.push({
      id: doc.id,
      ...doc.data()
    });
  });
  
  return NextResponse.json({ queue, status });
}