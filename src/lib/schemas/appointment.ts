import { z } from 'zod'

export const PLATE_REGEX_APPOINTMENT = /^[A-Z0-9][A-Z0-9 -]{2,}$/

export const createAppointmentSchema = z.object({
  customerId: z.string().trim().min(1, 'Customer is required'),
  name: z.string().trim().min(1, 'Name is required').optional().or(z.literal('')),
  phone: z.string().trim().min(1, 'Phone is required').optional().or(z.literal('')),
  email: z.string().trim().email('Invalid email').optional().or(z.literal('')),
  vehicleMake: z.string().trim().min(1, 'Vehicle make is required'),
  vehicleModel: z.string().trim().min(1, 'Vehicle model is required'),
  vehiclePlate: z
    .string()
    .trim()
    .min(1, 'Plate is required')
    .refine((val) => PLATE_REGEX_APPOINTMENT.test(val.trim().toUpperCase()), {
      message: 'Plate must be 3+ chars, uppercase alphanumerics, spaces or hyphens',
    }),
  complaint: z.string().trim().min(1, 'Complaint is required'),
  appointmentTs: z.number().refine((ts) => ts >= Date.now() - 60_000, {
    message: 'Appointment date cannot be in the past',
  }),
})

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>
