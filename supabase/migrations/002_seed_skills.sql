-- ============================================================
-- Migration: 002_seed_skills.sql
-- Seed data for shared skills catalog
-- ============================================================

INSERT INTO skills (skill_name, category, description) VALUES
-- Programming Languages
('Python',       'Programming Languages', 'General-purpose language popular in data science and backend'),
('JavaScript',   'Programming Languages', 'Core language of the web, used frontend and backend'),
('Java',         'Programming Languages', 'Object-oriented language widely used in enterprise'),
('C++',          'Programming Languages', 'Systems programming language with high performance'),
('C',            'Programming Languages', 'Low-level systems programming language'),
('TypeScript',   'Programming Languages', 'Typed superset of JavaScript'),
('Go',           'Programming Languages', 'Compiled language designed for scalability'),
('Rust',         'Programming Languages', 'Memory-safe systems programming language'),
('Kotlin',       'Programming Languages', 'Modern JVM language for Android and backend'),
('Swift',        'Programming Languages', 'Apple language for iOS and macOS development'),
-- Frontend Development
('React',        'Frontend Development', 'Component-based UI library by Meta'),
('Next.js',      'Frontend Development', 'React framework with SSR and routing'),
('Vue.js',       'Frontend Development', 'Progressive JavaScript framework'),
('HTML',         'Frontend Development', 'Markup language for web pages'),
('CSS',          'Frontend Development', 'Stylesheet language for web design'),
('Tailwind CSS', 'Frontend Development', 'Utility-first CSS framework'),
('Angular',      'Frontend Development', 'Full-featured frontend framework by Google'),
-- Backend Development
('Node.js',      'Backend Development', 'JavaScript runtime for server-side code'),
('Express.js',   'Backend Development', 'Minimal web framework for Node.js'),
('Django',       'Backend Development', 'High-level Python web framework'),
('FastAPI',      'Backend Development', 'Modern Python API framework'),
('Spring Boot',  'Backend Development', 'Java framework for microservices'),
('REST APIs',    'Backend Development', 'Architectural style for web services'),
('GraphQL',      'Backend Development', 'Query language for APIs'),
-- Databases
('PostgreSQL',   'Databases', 'Advanced open-source relational database'),
('MySQL',        'Databases', 'Popular open-source relational database'),
('MongoDB',      'Databases', 'Document-oriented NoSQL database'),
('Redis',        'Databases', 'In-memory key-value store'),
('SQLite',       'Databases', 'Lightweight embedded relational database'),
('Supabase',     'Databases', 'Open-source Firebase alternative on PostgreSQL'),
-- Data Science
('Pandas',       'Data Science', 'Python library for data manipulation'),
('NumPy',        'Data Science', 'Numerical computing library for Python'),
('Matplotlib',   'Data Science', 'Plotting library for Python'),
('Seaborn',      'Data Science', 'Statistical data visualization in Python'),
('SQL',          'Data Science', 'Structured Query Language for data analysis'),
('Power BI',     'Data Science', 'Business analytics tool by Microsoft'),
('Tableau',      'Data Science', 'Data visualization platform'),
-- Machine Learning
('Scikit-learn', 'Machine Learning', 'ML library for Python'),
('TensorFlow',   'Machine Learning', 'Open-source ML framework by Google'),
('PyTorch',      'Machine Learning', 'Deep learning framework by Meta'),
('Keras',        'Machine Learning', 'High-level neural network API'),
('OpenCV',       'Machine Learning', 'Computer vision library'),
('NLP',          'Machine Learning', 'Natural Language Processing techniques'),
-- Cloud Computing
('AWS',          'Cloud Computing', 'Amazon Web Services cloud platform'),
('Google Cloud', 'Cloud Computing', 'Google Cloud Platform services'),
('Azure',        'Cloud Computing', 'Microsoft Azure cloud services'),
('Docker',       'Cloud Computing', 'Containerization platform'),
('Kubernetes',   'Cloud Computing', 'Container orchestration system'),
('Terraform',    'Cloud Computing', 'Infrastructure as code tool'),
-- Cybersecurity
('Network Security',    'Cybersecurity', 'Protecting network infrastructure'),
('Ethical Hacking',     'Cybersecurity', 'Penetration testing and vulnerability assessment'),
('Cryptography',        'Cybersecurity', 'Encryption and secure communication'),
('OWASP',               'Cybersecurity', 'Web application security standards'),
('Linux Security',      'Cybersecurity', 'Hardening and securing Linux systems'),
-- Tools and Technologies
('Git',          'Tools and Technologies', 'Distributed version control system'),
('GitHub',       'Tools and Technologies', 'Code hosting and collaboration platform'),
('Linux',        'Tools and Technologies', 'Open-source operating system'),
('VS Code',      'Tools and Technologies', 'Popular code editor by Microsoft'),
('Postman',      'Tools and Technologies', 'API testing and development tool'),
('Figma',        'Tools and Technologies', 'Collaborative UI/UX design tool'),
('Jira',         'Tools and Technologies', 'Project management and issue tracking')
ON CONFLICT (skill_name) DO NOTHING;
