'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { MOOD_CONFIG, type MoodType } from '@/lib/types/mood';
import { useMoodStore } from '@/lib/stores/moodStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Smile } from 'lucide-react';

interface MoodSelectorProps {
  onMoodSelected?: (mood: MoodType) => void;
  trigger?: React.ReactNode;
  showButton?: boolean;
}

export function MoodSelector({ onMoodSelected, trigger, showButton = true }: MoodSelectorProps) {
  const addMood = useMoodStore((state) => state.addMood);
  const [open, setOpen] = useState(false);
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [note, setNote] = useState('');

  const handleMoodClick = (mood: MoodType) => {
    setSelectedMood(mood);
  };

  const handleSubmit = () => {
    if (selectedMood) {
      addMood(selectedMood, note || undefined);
      onMoodSelected?.(selectedMood);
      setOpen(false);
      setSelectedMood(null);
      setNote('');
    }
  };

  const triggerElement = trigger || (
    <Button variant="outline" size="lg" className="gap-2">
      <Smile className="w-5 h-5" />
      How are you feeling?
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerElement}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>How are you feeling?</DialogTitle>
          <DialogDescription>
            Select your current mood to track your emotional well-being.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Mood selection */}
          <div className="grid grid-cols-5 gap-2">
            {MOOD_CONFIG.map((mood, index) => (
              <motion.button
                key={mood.type}
                type="button"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  delay: index * 0.05,
                  type: 'spring',
                  stiffness: 300,
                  damping: 20,
                }}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleMoodClick(mood.type)}
                className={`
                  relative flex flex-col items-center gap-2 p-3 rounded-xl
                  transition-all duration-200
                  ${selectedMood === mood.type
                    ? 'bg-primary/10 border-2 border-primary ring-2 ring-primary/20'
                    : 'bg-muted/50 border-2 border-transparent hover:bg-muted'
                  }
                `}
              >
                <span className={`text-3xl transition-transform ${selectedMood === mood.type ? 'scale-125' : ''}`}>
                  {mood.emoji}
                </span>
                <span
                  className={cn(
                    'text-xs font-medium',
                    selectedMood === mood.type ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  {mood.label}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Note input */}
          <div className="space-y-2">
            <Label htmlFor="mood-note">Note (optional)</Label>
            <Input
              id="mood-note"
              placeholder="What's on your mind?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground text-right">
              {note.length}/200
            </p>
          </div>

          {/* Submit button */}
          <Button
            onClick={handleSubmit}
            disabled={!selectedMood}
            className="w-full"
            size="lg"
          >
            {selectedMood
              ? `Save ${MOOD_CONFIG.find(m => m.type === selectedMood)?.label} mood`
              : 'Select a mood'
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Compact mood display component
interface MoodDisplayProps {
  mood: MoodType;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function MoodDisplay({ mood, showLabel = false, size = 'md' }: MoodDisplayProps) {
  const config = MOOD_CONFIG.find(m => m.type === mood);
  if (!config) return null;

  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  return (
    <div className="flex items-center gap-2">
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        className={sizeClasses[size]}
      >
        {config.emoji}
      </motion.span>
      {showLabel && (
        <span className="text-sm text-muted-foreground">{config.label}</span>
      )}
    </div>
  );
}
