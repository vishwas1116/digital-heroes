require('dotenv').config();

const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');

const User = require('../models/User');
const Charity = require('../models/Charity');
const Score = require('../models/Score');

const seed = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB...');

    // Clear existing data
    await User.deleteMany({});
    await Charity.deleteMany({});
    await Score.deleteMany({});

    console.log('Cleared existing data');

    // Create charities
    const charities = await Charity.insertMany([
      {
        name: 'Green Earth Foundation',
        slug: 'green-earth-foundation',
        description:
          'Working towards a cleaner planet through reforestation and sustainable living programs across India.',
        shortDescription: 'Reforestation & sustainability',
        category: 'environment',
        impactStatement: 'Planted over 2.4 lakh trees in the last 3 years.',
        isFeatured: true,
        isActive: true,
        image:
          'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800',
        upcomingEvents: [
          {
            title: 'Monsoon Tree Plantation Drive',
            date: new Date('2026-07-15'),
            location: 'Pune',
            description: 'Join us for a community plantation day.'
          }
        ]
      },
      {
        name: 'Kids Education Trust',
        slug: 'kids-education-trust',
        description:
          'Providing quality education and scholarships to underprivileged children in rural India.',
        shortDescription: 'Education for every child',
        category: 'education',
        impactStatement:
          'Supported 12,000+ children with school kits and scholarships.',
        isFeatured: false,
        isActive: true,
        image:
          'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800'
      },
      {
        name: 'Cancer Care India',
        slug: 'cancer-care-india',
        description:
          'Supporting cancer patients with treatment funds, counseling and awareness programs.',
        shortDescription: 'Hope for cancer patients',
        category: 'health',
        impactStatement:
          'Helped 8,500+ patients with financial aid and support.',
        isFeatured: true,
        isActive: true,
        image:
          'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800'
      },
      {
        name: 'Sports for All',
        slug: 'sports-for-all',
        description:
          'Making sports accessible to children from low-income families through training and equipment.',
        shortDescription: 'Sports equality',
        category: 'sports',
        impactStatement:
          'Trained 3,200 young athletes across 40 cities.',
        isFeatured: false,
        isActive: true,
        image:
          'https://images.unsplash.com/photo-1461896836934-ffe607ba6851?w=800'
      },
      {
        name: 'Community First',
        slug: 'community-first',
        description:
          'Local community development, skill training and women empowerment initiatives.',
        shortDescription: 'Stronger communities',
        category: 'community',
        impactStatement:
          'Empowered 5,000+ women with livelihood skills.',
        isFeatured: false,
        isActive: true,
        image:
          'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800'
      },
      {
        name: 'Little Hearts Foundation',
        slug: 'little-hearts-foundation',
        description:
          'Supporting orphaned and abandoned children with shelter, education and emotional care.',
        shortDescription: 'Care for every child',
        category: 'children',
        impactStatement:
          'Currently supporting 1,800 children in 12 homes.',
        isFeatured: false,
        isActive: true,
        image:
          'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800'
      }
    ]);

    console.log(`Created ${charities.length} charities`);

    // Admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@digitalheroes-demo.com',
      password: 'DemoAdmin2026!',
      role: 'admin',
      isActive: true,
      charity: charities[0]._id,
      charityContributionPercent: 15,
      subscription: {
        plan: 'yearly',
        status: 'active',
        currentPeriodEnd: new Date(
          Date.now() + 365 * 24 * 60 * 60 * 1000
        )
      }
    });

    console.log('Admin created:', admin.email);

    // Demo user
    const demoUser = await User.create({
      name: 'Demo Player',
      email: 'demo@digitalheroes-demo.com',
      password: 'DemoUser2026!',
      role: 'user',
      isActive: true,
      charity: charities[2]._id,
      charityContributionPercent: 20,
      subscription: {
        plan: 'monthly',
        status: 'active',
        currentPeriodEnd: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        )
      }
    });

    console.log('Demo user created:', demoUser.email);

    // Verify demo password
    const testUser = await User.findOne({
      email: 'demo@digitalheroes-demo.com'
    }).select('+password');

    const isMatch = await testUser.comparePassword('DemoUser2026!');

    console.log(
      'Password verification test:',
      isMatch ? 'PASSED ✅' : 'FAILED ❌'
    );

    // Hash once for users inserted directly into collection
    const hashedPassword = await bcrypt.hash('Password123!', 12);

    await User.collection.insertMany([
      {
        name: 'Priya Sharma',
        email: 'priya@example.com',
        password: hashedPassword,
        role: 'user',
        isActive: true,
        charity: charities[1]._id,
        charityContributionPercent: 10,
        subscription: {
          plan: 'monthly',
          status: 'active',
          currentPeriodEnd: new Date(
            Date.now() + 25 * 24 * 60 * 60 * 1000
          )
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Rahul Verma',
        email: 'rahul@example.com',
        password: hashedPassword,
        role: 'user',
        isActive: true,
        charity: charities[0]._id,
        charityContributionPercent: 25,
        subscription: {
          plan: 'yearly',
          status: 'active',
          currentPeriodEnd: new Date(
            Date.now() + 300 * 24 * 60 * 60 * 1000
          )
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Ananya Patel',
        email: 'ananya@example.com',
        password: hashedPassword,
        role: 'user',
        isActive: true,
        charity: charities[3]._id,
        charityContributionPercent: 15,
        subscription: {
          plan: 'monthly',
          status: 'lapsed'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    console.log('Created 3 additional users');

    // Sample scores for demo user
    const today = new Date();
    const scores = [];

    for (let i = 0; i < 5; i++) {
      const d = new Date(today);

      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);

      scores.push({
        user: demoUser._id,
        value: 28 + Math.floor(Math.random() * 12),
        date: d
      });
    }

    await Score.insertMany(scores);

    console.log('Created sample scores for demo user');

    console.log('\n✅ Seed completed successfully!\n');

    console.log('========================================');
    console.log('Demo Credentials:');
    console.log(
      'User  → demo@digitalheroes-demo.com / DemoUser2026!'
    );
    console.log(
      'Admin → admin@digitalheroes-demo.com / DemoAdmin2026!'
    );
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();