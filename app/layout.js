import './globals.css';
import PageEffects from '../components/PageEffects';

export const metadata = {
  title: 'SkillPath – Student Skill & Course Recommendation',
  description: 'Build your student profile, track your skills, and discover courses tailored to your goals.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <PageEffects />
        {children}
      </body>
    </html>
  );
}
