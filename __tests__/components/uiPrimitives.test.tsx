import {
  Badge,
  Button,
  Card,
  Chip,
  Dialog,
  DonutChart,
  EmptyState,
  Field,
  Input,
  ProgressBar,
  ProgressRing,
  SourceBadge,
  ThemeToggle,
} from '@/components/ui'
import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

describe('UI Primitives accessibility & behavior', () => {
  describe('Button', () => {
    it('renders with accessible role and custom variant', () => {
      render(<Button variant="primary">Click Me</Button>)
      const btn = screen.getByRole('button', { name: 'Click Me' })
      expect(btn).toBeInTheDocument()
      expect(btn).not.toBeDisabled()
    })

    it('sets aria-busy and disables button when loading', () => {
      render(
        <Button loading variant="primary">
          Saving
        </Button>
      )
      const btn = screen.getByRole('button', { name: 'Saving' })
      expect(btn).toHaveAttribute('aria-busy', 'true')
      expect(btn).toBeDisabled()
    })
  })

  describe('Badge', () => {
    it('renders with custom variant and text', () => {
      render(<Badge variant="accent">Celebration</Badge>)
      expect(screen.getByText('Celebration')).toBeInTheDocument()
    })
  })

  describe('Field', () => {
    it('wires label htmlFor to input id and chains aria-describedby for hints', () => {
      render(
        <Field
          id="test-field"
          label="Celebration City"
          hint="Where the event takes place"
        >
          <Input placeholder="Enter city" />
        </Field>
      )

      const label = screen.getByText('Celebration City')
      expect(label).toHaveAttribute('for', 'test-field')

      const input = screen.getByPlaceholderText('Enter city')
      expect(input).toHaveAttribute('id', 'test-field')
      expect(input).toHaveAttribute('aria-describedby', 'test-field-hint')
      expect(input).not.toHaveAttribute('aria-invalid')

      const hint = screen.getByText('Where the event takes place')
      expect(hint).toHaveAttribute('id', 'test-field-hint')
    })

    it('wires aria-describedby and role=alert on validation errors', () => {
      render(
        <Field
          id="error-field"
          label="Budget"
          error="Budget must be greater than zero"
        >
          <Input />
        </Field>
      )

      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-describedby', 'error-field-error')
      expect(input).toHaveAttribute('aria-invalid', 'true')

      const alert = screen.getByRole('alert')
      expect(alert).toHaveTextContent('Budget must be greater than zero')
    })
  })

  describe('Chip', () => {
    it('acts as a toggle button with aria-pressed', () => {
      const handleToggle = jest.fn()
      const { rerender } = render(
        <Chip selected={false} onToggle={handleToggle}>
          Royal Traditional
        </Chip>
      )

      const chip = screen.getByRole('button', { name: 'Royal Traditional' })
      expect(chip).toHaveAttribute('aria-pressed', 'false')

      fireEvent.click(chip)
      expect(handleToggle).toHaveBeenCalledWith(true)

      rerender(
        <Chip selected={true} onToggle={handleToggle}>
          Royal Traditional
        </Chip>
      )
      expect(chip).toHaveAttribute('aria-pressed', 'true')
    })
  })

  describe('ProgressRing & ProgressBar', () => {
    it('ProgressRing exposes role=progressbar and clamped aria values', () => {
      render(<ProgressRing value={75} label="Readiness" />)
      const ring = screen.getByRole('progressbar', { name: 'Readiness' })
      expect(ring).toHaveAttribute('aria-valuenow', '75')
      expect(ring).toHaveAttribute('aria-valuemin', '0')
      expect(ring).toHaveAttribute('aria-valuemax', '100')
    })

    it('ProgressBar exposes role=progressbar with percentage', () => {
      render(<ProgressBar value={40} label="Milestones" />)
      const bar = screen.getByRole('progressbar', { name: 'Milestones' })
      expect(bar).toHaveAttribute('aria-valuenow', '40')
      expect(bar).toHaveAttribute('aria-valuemin', '0')
      expect(bar).toHaveAttribute('aria-valuemax', '100')
    })
  })

  describe('DonutChart', () => {
    it('renders pure SVG and includes accessible screen-reader table fallback', () => {
      const segments = [
        { id: 'venue', label: 'Venue', value: 300000, color: '#4F46E5' },
        { id: 'catering', label: 'Catering', value: 400000, color: '#10B981' },
      ]

      render(
        <DonutChart
          segments={segments}
          title="Celebration budget distribution"
        />
      )

      // Screen-reader table fallback
      const table = screen.getByRole('table', { hidden: true })
      expect(table).toHaveClass('sr-only')
      expect(
        screen.getByText('Celebration budget distribution')
      ).toBeInTheDocument()
      expect(screen.getAllByText('Venue').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Catering').length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Dialog', () => {
    it('renders modal dialog with accessible title', () => {
      render(
        <Dialog
          open={true}
          onOpenChange={jest.fn()}
          title="Edit Milestone"
          description="Update task due date"
        >
          <div>Dialog Inner Content</div>
        </Dialog>
      )

      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
      expect(screen.getByText('Edit Milestone')).toBeInTheDocument()
      expect(screen.getByText('Dialog Inner Content')).toBeInTheDocument()
    })
  })

  describe('ThemeToggle', () => {
    it('toggles light and dark theme and persists in localStorage', () => {
      render(<ThemeToggle />)
      const toggle = screen.getByRole('button', {
        name: /switch to (dark|light) theme/i,
      })
      expect(toggle).toBeInTheDocument()

      fireEvent.click(toggle)
      expect(document.documentElement.getAttribute('data-theme')).toBeTruthy()
    })
  })

  describe('SourceBadge', () => {
    it('honestly renders Gemini and Smart template badges', () => {
      const { rerender } = render(
        <SourceBadge source="gemini" model="gemini-3.8-flash" />
      )
      expect(screen.getByText('Gemini')).toBeInTheDocument()

      rerender(<SourceBadge source="template" />)
      expect(screen.getByText('Smart template')).toBeInTheDocument()
    })
  })

  describe('Card & EmptyState', () => {
    it('renders Card and EmptyState with accessible semantics', () => {
      render(
        <Card variant="surface">
          <EmptyState
            title="No Items"
            description="Create an item to get started"
            action={<Button>Create</Button>}
          />
        </Card>
      )

      expect(screen.getByText('No Items')).toBeInTheDocument()
      expect(
        screen.getByText('Create an item to get started')
      ).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument()
    })
  })
})
