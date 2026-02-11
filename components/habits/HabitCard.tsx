'use client';

import { motion } from 'framer-motion';
import { Flame, MoreVertical, Trash2, Edit2 } from 'lucide-react';
import { useState } from 'react';
import { Habit } from '@/lib/types/habit';
import { useHabitStore } from '@/lib/stores/habitStore';
import { getTodayStr } from '@/lib/utils/dateUtils';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

const CATEGORY_COLORS = {
  health: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  productivity: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  mindfulness: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  social: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  other: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
};

interface HabitCardProps {
  habit: Habit;
  streak?: number;
  onEdit?: (habit: Habit) => void;
  showActions?: boolean;
}

export function HabitCard({ habit, streak, onEdit, showActions = true }: HabitCardProps) {
  const toggleCompletion = useHabitStore((state) => state.toggleCompletion);
  const deleteHabit = useHabitStore((state) => state.deleteHabit);
  const [isDeleting, setIsDeleting] = useState(false);

  const today = getTodayStr();
  const isCompletedToday = habit.completedDates.includes(today);

  const handleToggle = () => {
    toggleCompletion(habit.id, today);
  };

  const handleDelete = () => {
    deleteHabit(habit.id);
    setIsDeleting(false);
  };

  const categoryColor = habit.category
    ? CATEGORY_COLORS[habit.category]
    : CATEGORY_COLORS.other;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <div
        className={`
          relative overflow-hidden rounded-xl border-2 transition-all duration-300
          ${isCompletedToday
            ? 'bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/30'
            : 'bg-card border-border hover:border-primary/30 hover:shadow-lg'
          }
        `}
      >
        {/* Completion glow effect */}
        {isCompletedToday && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 to-transparent pointer-events-none"
          />
        )}

        <div className="relative p-4 sm:p-5">
          <div className="flex items-start gap-3 sm:gap-4">
            {/* Checkbox */}
            <motion.div
              whileTap={{ scale: 0.9 }}
              className="pt-0.5"
            >
              <Checkbox
                checked={isCompletedToday}
                onCheckedChange={handleToggle}
                className={`
                  h-6 w-6 sm:h-7 sm:w-7 rounded-full border-2
                  transition-all duration-300
                  ${isCompletedToday
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'border-muted-foreground/30 hover:border-primary/50'
                  }
                `}
              />
            </motion.div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3
                    className={`
                      font-semibold text-base sm:text-lg transition-all duration-300
                      ${isCompletedToday
                        ? 'line-through text-muted-foreground'
                        : 'text-foreground'
                      }
                    `}
                  >
                    {habit.name}
                  </h3>
                  {habit.description && (
                    <p
                      className={`
                        text-sm mt-1 transition-all duration-300
                        ${isCompletedToday
                          ? 'text-muted-foreground/50'
                          : 'text-muted-foreground'
                        }
                      `}
                    >
                      {habit.description}
                    </p>
                  )}
                </div>

                {/* Streak badge */}
                {(streak !== undefined && streak > 0) && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20"
                  >
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-semibold text-orange-600">
                      {streak}
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Category badge */}
              {habit.category && (
                <Badge variant="outline" className={`mt-2 ${categoryColor}`}>
                  {habit.category}
                </Badge>
              )}
            </div>

            {/* Actions */}
            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(habit)}>
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => setIsDeleting(true)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Progress bar for daily goals */}
        {habit.targetDays && habit.targetDays > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(habit.completedDates.length % habit.targetDays) / habit.targetDays * 100}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
            />
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Habit</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{habit.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleting(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
