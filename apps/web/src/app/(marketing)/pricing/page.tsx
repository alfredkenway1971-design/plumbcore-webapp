import type { Metadata } from 'next';
import PricingCards from '@/components/PricingCards';

export const metadata: Metadata = {
  title: 'Pricing — PlumbCore AI',
  description: 'Simple, transparent pricing for your plumbing business.',
};

export default function PricingPage() {
  return <PricingCards />;
}
