'use client'

import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import type { ContactDetails, CvFormData, CvFormErrors } from '@/lib/cv-tailor/types'

interface StepContactProps {
  form: CvFormData
  errors: CvFormErrors
  onChange: (patch: Partial<CvFormData>) => void
}

export default function StepContact({ form, errors, onChange }: StepContactProps) {
  function updateContact(field: keyof ContactDetails, value: string) {
    onChange({ contact: { ...form.contact, [field]: value } })
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold text-primary">About you</h2>
        <p className="text-sm text-muted mt-1">
          Your contact details appear at the top of your CV. The summary is optional — leave it
          blank and we will write one for you from the rest of your answers.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          id="contact-fullName"
          label="Full name *"
          placeholder="e.g. Amara Okafor"
          value={form.contact.fullName}
          error={errors['contact.fullName']}
          onChange={(event) => updateContact('fullName', event.target.value)}
        />
        <Input
          id="contact-email"
          label="Email *"
          type="email"
          placeholder="e.g. amara.okafor@email.com"
          value={form.contact.email}
          error={errors['contact.email']}
          onChange={(event) => updateContact('email', event.target.value)}
        />
        <Input
          id="contact-phone"
          label="Phone *"
          type="tel"
          placeholder="e.g. 07700 900123"
          value={form.contact.phone}
          error={errors['contact.phone']}
          onChange={(event) => updateContact('phone', event.target.value)}
        />
        <Input
          id="contact-location"
          label="Location *"
          placeholder="e.g. Manchester, UK"
          value={form.contact.location}
          error={errors['contact.location']}
          onChange={(event) => updateContact('location', event.target.value)}
        />
      </div>

      <Input
        id="contact-linkedin"
        label="LinkedIn (optional)"
        placeholder="e.g. linkedin.com/in/amara-okafor"
        value={form.contact.linkedin}
        onChange={(event) => updateContact('linkedin', event.target.value)}
      />

      <Textarea
        id="summary"
        label="Professional summary / intro paragraph (optional)"
        placeholder="A short paragraph introducing yourself, your degree and what you're looking for. Leave blank and we'll generate one tailored to your chosen industry."
        hint="2–4 sentences works best. We'll polish it and tailor it to your target industry."
        rows={4}
        value={form.summary}
        onChange={(event) => onChange({ summary: event.target.value })}
      />
    </div>
  )
}
