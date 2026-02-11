'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Save } from 'lucide-react';
import { Habit } from '@/lib/types/habit';
import { useHabitStore } from '@/lib/stores/habitStore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const HABIT_COLORS = [
  { value: 'indigo', label: 'Indigo', class: 'bg-indigo-500' },
  { value: 'emerald', label: 'Emerald', class: 'bg-emerald-500' },
  { value: 'amber', label: 'Amber', class: 'bg-amber-500' },
  { value: 'rose', label: 'Rose', class: 'bg-rose-500' },
  { value: 'cyan', label: 'Cyan', class: 'bg-cyan-500' },
  { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
];

const HABIT_CATEGORIES = [
  { value: 'health', label: 'Health' },
  { value: 'productivity', label: 'Productivity' },
  { value: 'mindfulness', label: 'Mindfulness' },
  { value: 'social', label: 'Social' },
  { value: 'other', label: 'Other' },
];

interface HabitFormProps {
  habit?: Habit;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function HabitForm({ habit, onSuccess, trigger }: HabitFormProps) {
  const addHabit = useHabitStore((state) => state.addHabit);
  const updateHabit = useHabitStore((state) => state.updateHabit);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState(habit?.name || '');
  const [description, setDescription] = useState(habit?.description || '');
  const [category, setCategory] = useState(habit?.category || 'other');
  const [color, setColor] = useState(habit?.color || 'indigo');
  const [active, setActive] = useState(habit?.active ?? true);
  const [errors, setErrors] = useState<{ name?: string }>({});

  useEffect(() => {
    if (habit) {
      setName(habit.name);
      setDescription(habit.description || '');
      setCategory(habit.category || 'other');
      setColor(habit.color || 'indigo');
      setActive(habit.active);
    }
  }, [habit]);

  const validate = () => {
    const newErrors: { name?: string } = {};
    if (!name.trim()) {
      newErrors.name = 'Habit name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    if (habit) {
      updateHabit(habit.id, {
        name,
        description,
        category,
        color,
        active,
      });
    } else {
      addHabit({
        name,
        description,
        category: category as any,
        color,
        active,
      });
    }

    setOpen(false);
    onSuccess?.();

    // Reset form for new habit
    if (!habit) {
      setName('');
      setDescription('');
      setCategory('other');
      setColor('indigo');
      setActive(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            size="lg"
            className="gap-2"
          >
            <Plus className="w-5 h-5" />
            New Habit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {habit ? 'Edit Habit' : 'Create New Habit'}
          </DialogTitle>
          <DialogDescription>
            {habit
              ? 'Update your habit details below.'
              : 'Start building a new positive habit today.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Habit Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Morning Meditation"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              placeholder="e.g., 10 minutes of focused breathing"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HABIT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2">
              {HABIT_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`
                    w-10 h-10 rounded-full transition-all duration-200
                    ${color === c.value ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:scale-105'}
                    ${c.class}
                  `}
                  aria-label={c.label}
                />
              ))}
            </div>
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="active">Active</Label>
            <Switch
              id="active"
              checked={active}
              onCheckedChange={setActive}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              {habit ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
