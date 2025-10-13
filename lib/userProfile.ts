'use server';

import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export interface UserProfile {
  id: string;
  financialGoals: string[];
  riskTolerance: 'low' | 'medium' | 'high';
  investmentExperience: 'beginner' | 'intermediate' | 'advanced';
  monthlyIncome?: number;
  monthlyExpenses?: number;
  age?: number;
  occupation?: string;
}

export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const user = await currentUser();
    if (!user) return null;

    // Check if user profile exists in database
    const profile = await prisma.userProfile.findUnique({
      where: { userId: user.id }
    });

    if (profile) {
      return {
        id: profile.id,
        financialGoals: profile.financialGoals,
        riskTolerance: profile.riskTolerance as 'low' | 'medium' | 'high',
        investmentExperience: profile.investmentExperience as 'beginner' | 'intermediate' | 'advanced',
        monthlyIncome: profile.monthlyIncome,
        monthlyExpenses: profile.monthlyExpenses,
        age: profile.age,
        occupation: profile.occupation
      };
    }

    // Return default profile if none exists
    return {
      id: user.id,
      financialGoals: ['Build emergency fund', 'Plan for retirement'],
      riskTolerance: 'medium',
      investmentExperience: 'beginner',
      monthlyIncome: undefined,
      monthlyExpenses: undefined,
      age: undefined,
      occupation: undefined
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export async function updateUserProfile(profileData: Partial<UserProfile>): Promise<UserProfile | null> {
  try {
    const user = await currentUser();
    if (!user) return null;

    const profile = await prisma.userProfile.upsert({
      where: { userId: user.id },
      update: {
        financialGoals: profileData.financialGoals,
        riskTolerance: profileData.riskTolerance,
        investmentExperience: profileData.investmentExperience,
        monthlyIncome: profileData.monthlyIncome,
        monthlyExpenses: profileData.monthlyExpenses,
        age: profileData.age,
        occupation: profileData.occupation
      },
      create: {
        userId: user.id,
        financialGoals: profileData.financialGoals || ['Build emergency fund', 'Plan for retirement'],
        riskTolerance: profileData.riskTolerance || 'medium',
        investmentExperience: profileData.investmentExperience || 'beginner',
        monthlyIncome: profileData.monthlyIncome,
        monthlyExpenses: profileData.monthlyExpenses,
        age: profileData.age,
        occupation: profileData.occupation
      }
    });

    return {
      id: profile.id,
      financialGoals: profile.financialGoals,
      riskTolerance: profile.riskTolerance as 'low' | 'medium' | 'high',
      investmentExperience: profile.investmentExperience as 'beginner' | 'intermediate' | 'advanced',
      monthlyIncome: profile.monthlyIncome,
      monthlyExpenses: profile.monthlyExpenses,
      age: profile.age,
      occupation: profile.occupation
    };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return null;
  }
}

