export const metadata = {
  title: 'YAF Store - Young Agripreneurs',
  description: 'Gen-Z grub delivered. Snacks, drinks & more, straight to your res room.',
  icons: {
    icon: '/pictures/profile.jpeg', // Points to your existing profile picture!
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
