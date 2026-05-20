import type { OnboardingResult } from './onboardingTypes';

let onboardingResult: OnboardingResult | null = null;

export function setOnboardingResult(result: OnboardingResult): void {
    onboardingResult = result;
}

export function getOnboardingResult(): OnboardingResult | null {
    return onboardingResult;
}
