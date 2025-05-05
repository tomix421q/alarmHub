import prismaClient from './../server/prisma';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { sendResetPasswordEmail } from './sendResetPasswordEmail';
import { sendVerificationEmail } from './sendVerificationEmail';

export const auth = betterAuth({
	database: prismaAdapter(prismaClient, {
		provider: 'sqlite'
	}),
	emailAndPassword: {
		autoSignIn: true,
		enabled: true,
		requireEmailVerification: true,
		sendResetPassword: async ({ user, url, token }, request) => {
			await sendResetPasswordEmail(url, user);
		}
	},
	emailVerification: {
		autoSignInAfterVerification: true,
		sendOnSignUp: true,
		sendVerificationEmail: async (options) => {
			const { user, url } = options;
			// console.log('Verification url:', url)
			await sendVerificationEmail(url, user);
		}
	},

	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
		}
	}
});
