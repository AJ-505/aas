import { z } from 'zod'

export const createAppointmentSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  phone: z.string().trim().min(1, 'Phone is required'),
  email: z.string().trim().email('Invalid email').optional().or(z.literal('')),
  vehicleMake: z.string().trim().min(1, 'Vehicle make is required'),
  vehicleModel: z.string().trim().min(1, 'Vehicle model is required'),
  vehiclePlate: z.string().trim().min(1, 'Plate is required'),
  complaint: z.string().trim().min(1, 'Complaint is required'),
  appointmentTs: z.number().refine((ts) => ts >= Date.now() - 60_000, {
    message: 'Appointment date cannot be in the past',
  }),
})

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>
