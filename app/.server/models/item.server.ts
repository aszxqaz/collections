import { prisma } from '../db';
import { safeDbExec } from './helpers.server';

type CreateCommentArgs = {
  username: string;
  itemId: number;
  content: string;
};

type CreateCommentResponse =
  | {
      ok: true;
    }
  | {
      ok: false;
    };

export async function createComment({ username, content, itemId }: CreateCommentArgs) {
  return safeDbExec(() =>
    prisma.comment.create({
      data: {
        content,
        itemId,
        username,
      },
    }),
  );
}

type LikeItemArgs = {
  username: string;
  itemId: number;
};

export async function likeItem({ itemId, username }: LikeItemArgs) {
  return safeDbExec(() =>
    prisma.item.update({
      where: { id: itemId },
      data: {
        likers: {
          connect: {
            username,
          },
        },
      },
    }),
  );
}

export async function unlikeItem({ itemId, username }: LikeItemArgs) {
  return safeDbExec(() =>
    prisma.item.update({
      where: { id: itemId },
      data: {
        likers: {
          disconnect: {
            username,
          },
        },
      },
    }),
  );
}
