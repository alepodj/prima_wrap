import { QueryCompany } from '../../../../types'
import { useState } from 'react'
import { toast } from '@medusajs/ui'
import { Button, Drawer, Heading, Input, Label, Text } from '@medusajs/ui'

interface CompanyInviteEmployeeDrawerProps {
  company: QueryCompany
  open: boolean
  setOpen: (open: boolean) => void
}

export const CompanyInviteEmployeeDrawer = ({
  company,
  open,
  setOpen,
}: CompanyInviteEmployeeDrawerProps) => {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !firstName || !lastName) {
      toast.error('Please fill in all fields')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(
        `/admin/companies/${company.id}/invite-employee`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            first_name: firstName,
            last_name: lastName,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send invitation')
      }

      toast.success('Employee invitation sent successfully')
      setEmail('')
      setFirstName('')
      setLastName('')
      setOpen(false)
    } catch (error) {
      console.error('Error sending invitation:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to send invitation'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>Invite Employee to {company.name}</Drawer.Title>
          <Drawer.Description>
            Send an invitation to a new employee to join your company.
          </Drawer.Description>
        </Drawer.Header>
        <form onSubmit={handleSubmit}>
          <Drawer.Body>
            <div className='space-y-4'>
              <div>
                <Label htmlFor='email'>Email Address</Label>
                <Input
                  id='email'
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder='employee@example.com'
                  required
                />
              </div>
              <div>
                <Label htmlFor='firstName'>First Name</Label>
                <Input
                  id='firstName'
                  type='text'
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder='John'
                  required
                />
              </div>
              <div>
                <Label htmlFor='lastName'>Last Name</Label>
                <Input
                  id='lastName'
                  type='text'
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder='Doe'
                  required
                />
              </div>
            </div>
          </Drawer.Body>
          <Drawer.Footer>
            <div className='flex gap-2 justify-end'>
              <Button
                variant='secondary'
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Invitation'}
              </Button>
            </div>
          </Drawer.Footer>
        </form>
      </Drawer.Content>
    </Drawer>
  )
}
