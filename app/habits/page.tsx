'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHabitStore } from '@/lib/stores/habitStore';
import { HabitCard } from '@/components/habits/HabitCard';
import { HabitForm } from '@/components/habits/HabitForm';
import { Habit } from '@/lib/types/habit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';

const CATEGORIES = ['health', 'productivity', 'mindfulness', 'social', 'other'] as const;

export default function HabitsPage() {
  const habits = useHabitStore((state) => state.habits);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingHabit, setEditingHabit] = useState<Habit | undefined>();

  const filteredHabits = habits
    .filter(habit => {
      const matchesSearch = habit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        habit.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || habit.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      // Sort active habits first
      if (a.active !== b.active) return a.active ? -1 : 1;
      // Then by creation date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const activeHabits = filteredHabits.filter(h => h.active);
  const inactiveHabits = filteredHabits.filter(h => !h.active);

  return (
    <div className="min-h-screen pb-24 px-4">
      <div className="container mx-auto max-w-2xl py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Habits</h1>
            <p className="text-sm text-muted-foreground">
              Manage your habit tracking
            </p>
          </div>
          <HabitForm trigger={
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Habit
            </Button>
          } />
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search habits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`
              px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
              ${selectedCategory === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }
            `}
          >
            All ({habits.length})
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors capitalize
                ${selectedCategory === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }
              `}
            >
              {cat} ({habits.filter(h => h.category === cat).length})
            </button>
          ))}
        </div>

        {/* Active habits */}
        <AnimatePresence>
          {activeHabits.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-8"
            >
              <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-1">
                Active Habits
              </h2>
              <div className="space-y-3">
                {activeHabits.map(habit => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    onEdit={setEditingHabit}
                    showActions
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Inactive habits */}
        <AnimatePresence>
          {inactiveHabits.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-1">
                Inactive Habits
              </h2>
              <div className="space-y-3 opacity-60">
                {inactiveHabits.map(habit => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    onEdit={setEditingHabit}
                    showActions
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {filteredHabits.length === 0 && habits.length > 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No habits match your search or filter.
            </p>
          </div>
        )}

        {habits.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2">No habits yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first habit to start building better routines.
            </p>
            <HabitForm />
          </div>
        )}

        {/* Edit dialog */}
        <AnimatePresence>
          {editingHabit && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setEditingHabit(undefined)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-background rounded-xl p-6 w-full max-w-md"
              >
                <HabitForm
                  habit={editingHabit}
                  onSuccess={() => setEditingHabit(undefined)}
                  trigger={<></>}
                />
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => setEditingHabit(undefined)}
                >
                  Cancel
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
