import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const mistakes = await prisma.mistake.findMany({
      where: { userId: session.userId },
      orderBy: { frequency: 'desc' },
    });

    return NextResponse.json(mistakes);
  } catch (error) {
    console.error('Get mistakes error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, category } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const mistake = await prisma.mistake.create({
      data: {
        userId: session.userId,
        title,
        description: description || null,
        category: category || null,
      },
    });

    return NextResponse.json(mistake);
  } catch (error) {
    console.error('Create mistake error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
