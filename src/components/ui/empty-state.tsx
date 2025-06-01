
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionVariant?: 'default' | 'outline' | 'secondary';
  children?: React.ReactNode;
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction, 
  actionVariant = 'default',
  children 
}: EmptyStateProps) {
  return (
    <Card className="text-center py-8">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="rounded-full bg-muted p-4">
            <Icon className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription className="text-base max-w-md mx-auto">
              {description}
            </CardDescription>
          </div>
          {actionLabel && onAction && (
            <Button onClick={onAction} variant={actionVariant}>
              {actionLabel}
            </Button>
          )}
          {children}
        </div>
      </CardContent>
    </Card>
  );
}
