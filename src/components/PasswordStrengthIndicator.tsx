// src/components/PasswordStrengthIndicator.tsx
'use client'

import { useMemo } from 'react';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

const checkPasswordStrength = (password: string): {
  score: number;
  feedback: string[];
  strength: string;
  color: string;
} => {
  const feedback: string[] = [];
  let score = 0;
  
  if (!password) {
    return { 
      score: 0, 
      feedback: ['Password is required'], 
      strength: 'None',
      color: 'gray'
    };
  }
  
  // Length scoring
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  
  // Character variety
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;
  
  // Feedback messages
  if (password.length < 8) feedback.push('Use at least 8 characters');
  if (!/[a-z]/.test(password)) feedback.push('Add lowercase letters');
  if (!/[A-Z]/.test(password)) feedback.push('Add uppercase letters');
  if (!/[0-9]/.test(password)) feedback.push('Add numbers');
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    feedback.push('Add special characters (!@#$%^&*)');
  }
  
  // Check for common weak patterns
  if (/(.)\1{2,}/.test(password)) {
    score = Math.max(0, score - 1);
    feedback.push('Avoid repeating characters');
  }
  
  if (/123456|abcdef|qwerty|password/i.test(password)) {
    score = Math.max(0, score - 2);
    feedback.push('Avoid common patterns');
  }
  
  // Determine strength and color
  let strength = 'None';
  let color = 'gray';
  
  if (score >= 4) {
    strength = 'Very Strong';
    color = 'green';
  } else if (score >= 3) {
    strength = 'Strong';
    color = 'blue';
  } else if (score >= 2) {
    strength = 'Moderate';
    color = 'yellow';
  } else if (score >= 1) {
    strength = 'Weak';
    color = 'orange';
  } else if (password.length > 0) {
    strength = 'Very Weak';
    color = 'red';
  }
  
  return { score: Math.min(score, 4), feedback, strength, color };
};

export default function PasswordStrengthIndicator({ 
  password, 
  className = '' 
}: PasswordStrengthIndicatorProps) {
  const analysis = useMemo(() => checkPasswordStrength(password), [password]);
  
  if (!password) return null;
  
  const getIcon = () => {
    if (analysis.score >= 4) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (analysis.score >= 2) return <Shield className="w-4 h-4 text-blue-600" />;
    return <AlertTriangle className="w-4 h-4 text-orange-600" />;
  };
  
  const getColorClasses = (color: string) => {
    const colors = {
      green: 'bg-green-500',
      blue: 'bg-blue-500',
      yellow: 'bg-yellow-500',
      orange: 'bg-orange-500',
      red: 'bg-red-500',
      gray: 'bg-gray-300'
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };
  
  const getTextColorClasses = (color: string) => {
    const colors = {
      green: 'text-green-700',
      blue: 'text-blue-700',
      yellow: 'text-yellow-700',
      orange: 'text-orange-700',
      red: 'text-red-700',
      gray: 'text-gray-600'
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };
  
  return (
    <div className={`space-y-2 ${className}`}>
      {/* Strength Bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`h-2 flex-1 rounded-full transition-colors duration-200 ${
                  level <= analysis.score 
                    ? getColorClasses(analysis.color)
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {getIcon()}
          <span className={`text-xs font-medium ${getTextColorClasses(analysis.color)}`}>
            {analysis.strength}
          </span>
        </div>
      </div>
      
      {/* Feedback */}
      {analysis.feedback.length > 0 && (
        <div className="text-xs text-gray-600 space-y-1">
          {analysis.feedback.map((message, index) => (
            <div key={index} className="flex items-center gap-1">
              <span className="w-1 h-1 bg-gray-400 rounded-full flex-shrink-0"></span>
              <span>{message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}