import React from "react";
import { UnrespondedCard } from "./unresponded-card";
import { RespondedCard } from "./responded-card";

interface QuestionCardProps {
  responded?: boolean;
  blocked?: boolean;
  blockedReason?: string | null;
  blockedMessage?: string | null;
}

export const QuestionCard = ({ responded = false, blocked = false, blockedReason = null, blockedMessage = null }: QuestionCardProps) => {
  if (responded) {
    return <RespondedCard />;
  }
  return <UnrespondedCard blocked={blocked} blockedReason={blockedReason} blockedMessage={blockedMessage} />;
};
