import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createComment } from '../../../../database/comment';
import { getUserBySessionToken } from '../../../../database/users';
import { Comment } from '../../../../migrations/1686916408-createTableComments';

export type Error = {
  error: string;
};

type CommentsResponseBodyPost = { announcements: Comment[] } | Error;

const commentSchema = z.object({
  userId: z.number(),
  topic: z.number(),
  comment: z.string(),
});


export async function POST(
  request: NextRequest,
): Promise<NextResponse<CommentsResponseBodyPost>> {
  /*   const { searchParams } = new URL(request.url);
   */ const sessionTokenCookie = cookies().get('sessionToken');
  const userSession =
    sessionTokenCookie &&
    (await getUserBySessionToken(sessionTokenCookie.value));
  /*   console.log('This comes from API', userSession);
   */ if (!userSession) {
    return NextResponse.json(
      {
        error: 'Session token is not valid',
      },
      { status: 401 },
    );
  }
  const body = await request.json();
  console.log('body1', body);
  const result = commentSchema.safeParse(body);
  if (!result.success) {
    console.log(result.error);
    return NextResponse.json(
      {
        error: 'The data is incomplete',
      },
      { status: 400 },
    );
  }
  const newComment = await createComment(
    result.data.userId,
    result.data.topic,
    result.data.comment,
  );
  if (!newComment) {
    return NextResponse.json(
      {
        error: 'Error creating the new post',
      },
      { status: 500 },
    );
  }
  return NextResponse.json({ announcements: [newComment] });
}
