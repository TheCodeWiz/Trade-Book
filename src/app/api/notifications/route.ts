import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let settings = await prisma.notificationSettings.findUnique({
      where: { userId: session.userId },
    });

    // Create default settings if not exists
    if (!settings) {
      settings = await prisma.notificationSettings.create({
        data: {
          userId: session.userId,
          weeklyReports: true,
          goalAlerts: true,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Get notification settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { weeklyReports, goalAlerts } = body;

    const settings = await prisma.notificationSettings.upsert({
      where: { userId: session.userId },
      update: {
        ...(weeklyReports !== undefined && { weeklyReports }),
        ...(goalAlerts !== undefined && { goalAlerts }),
      },
      create: {
        userId: session.userId,
        weeklyReports: weeklyReports ?? true,
        goalAlerts: goalAlerts ?? true,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Update notification settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
