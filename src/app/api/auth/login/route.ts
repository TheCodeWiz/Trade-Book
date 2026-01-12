import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { generateOTP, getOTPExpiry } from '@/lib/auth';
import { sendOTPEmail, sendOTPSMS, canSendEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { email, password, otpMethod } = await request.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = getOTPExpiry();

    // Delete any existing unused OTPs for this user
    await prisma.otpCode.deleteMany({
      where: {
        userId: user.id,
        used: false,
      },
    });

    // Store OTP in database
    await prisma.otpCode.create({
      data: {
        code: otp,
        userId: user.id,
        type: otpMethod || 'email',
        expiresAt,
      },
    });

    // Check if email is configured
    const emailConfigured = canSendEmail();
    
    // Send OTP based on method
    let otpSent = false;
    if (otpMethod === 'phone' && user.phone) {
      otpSent = await sendOTPSMS(user.phone, otp);
    } else {
      otpSent = await sendOTPEmail(user.email, otp, user.name);
    }

    // For development/testing, also log the OTP
    console.log(`[DEV] OTP for ${user.email}: ${otp}`);

    if (!otpSent) {
      return NextResponse.json(
        { error: 'Failed to send OTP. Please try again.' },
        { status: 500 }
      );
    }

    // Build response
    const response: {
      message: string;
      userId: string;
      otpMethod: string;
      destination: string | null;
      demoMode?: boolean;
      demoOtp?: string;
    } = {
      message: emailConfigured ? 'OTP sent successfully' : 'OTP generated (Demo Mode - check below)',
      userId: user.id,
      otpMethod: otpMethod || 'email',
      destination: otpMethod === 'phone' ? user.phone : user.email,
    };

    // In demo mode (email not configured), include the OTP in response
    if (!emailConfigured) {
      response.demoMode = true;
      response.demoOtp = otp;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
