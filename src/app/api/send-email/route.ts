import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, subject, text } = body;

    if (!to || !subject || !text) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: 'ssl0.ovh.net',
      port: 465,
      secure: true,
      auth: {
        user: process.env.OVH_EMAIL,
        pass: process.env.OVH_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Nazwa Nadawcy" <${process.env.OVH_EMAIL}>`,
      to,
      subject,
      text,
    });

    return NextResponse.json({ message: 'Email sent' }, { status: 200 });
  } catch (error) {
    console.error('Email error:', error);
    return NextResponse.json({ message: 'Error sending email' }, { status: 500 });
  }
}
