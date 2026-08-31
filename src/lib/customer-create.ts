export type CustomerCreateDraft = {
  name: string
  phone: string
  email?: string
  address?: string
}

export function normalizeCustomerCreateInput(input: CustomerCreateDraft) {
  const name = input.name.trim()
  const phone = input.phone.trim()
  const email = input.email?.trim()
  const address = input.address?.trim()

  return {
    name,
    phone,
    email: email ? email.toLowerCase() : undefined,
    address: address || undefined,
  }
}
