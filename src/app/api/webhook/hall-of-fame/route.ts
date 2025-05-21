import { NextRequest, NextResponse } from 'next/server';
import { doc, setDoc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { getCurrentWeekNumber, getCurrentWeekRange } from '@/lib/firebase/hall-of-fame';

// Webhook secret for verification
const WEBHOOK_SECRET = process.env.HALL_OF_FAME_WEBHOOK_SECRET;

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
    const { eventType, submissionId, authorId, authorUsername, authorAvatar, videoUrl, platform, videoId, votes } = body;
    
    switch (eventType) {
      case 'new_submission':
        // Handle new submission
        const weekNumber = getCurrentWeekNumber();
        const weekRange = getCurrentWeekRange();
        
        await setDoc(doc(db, 'hallOfFame_submissions', submissionId), {
          videoUrl,
          platform: platform || 'unknown',
          videoId: videoId || '',
          authorId,
          authorUsername,
          authorAvatar,
          timestamp: new Date().toISOString(),
          votes: 0,
          weekNumber,
          weekStart: weekRange.start.toISOString(),
          weekEnd: weekRange.end.toISOString()
        });
        
        // Update user record
        const userRef = doc(db, 'hallOfFame_users', authorId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          await updateDoc(userRef, {
            totalSubmissions: increment(1),
            updatedAt: new Date().toISOString()
          });
        } else {
          await setDoc(userRef, {
            id: authorId,
            username: authorUsername,
            avatar: authorAvatar,
            totalVotes: 0,
            totalSubmissions: 1,
            weeklyVotes: {},
            updatedAt: new Date().toISOString()
          });
        }
        break;
        
      case 'vote_change':
        // Handle vote change
        const submissionRef = doc(db, 'hallOfFame_submissions', submissionId);
        const submissionSnap = await getDoc(submissionRef);
        
        if (submissionSnap.exists()) {
          const submissionData = submissionSnap.data();
          
          // Update submission votes
          await updateDoc(submissionRef, {
            votes: votes || increment(1)
          });
          
          // Update user's total votes
          const userVoteRef = doc(db, 'hallOfFame_users', submissionData.authorId);
          await updateDoc(userVoteRef, {
            totalVotes: increment(1),
            [`weeklyVotes.${submissionData.weekNumber}`]: increment(1),
            updatedAt: new Date().toISOString()
          });
        }
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