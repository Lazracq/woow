import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  PlayCircle, 
  Zap,
  Rocket,
  TrendingUp,
  Clock,
  Shield,
  Users,
  ArrowRight
} from 'lucide-react'
import { Link } from 'react-router-dom'

export function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const
      }
    }
  }

  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Execute workflows in milliseconds with our optimized engine"
    },
    {
      icon: Shield,
      title: "Enterprise Ready",
      description: "Built with security and scalability in mind"
    },
    {
      icon: Clock,
      title: "Real-time Monitoring",
      description: "Track execution progress with live updates"
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Work together seamlessly with shared workflows"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/20 dark:from-slate-950 dark:via-slate-900/50 dark:to-indigo-950/30">
      {/* Hero Section */}
      <motion.div 
        className="relative overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 via-cyan-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/10 via-pink-400/10 to-red-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
        </div>

        <div className="relative z-10 px-6 py-20 lg:py-32">
          <div className="max-w-7xl mx-auto text-center">
            {/* Main Heading */}
            <motion.div variants={itemVariants} className="mb-8">
              <motion.div 
                className="flex flex-col items-center justify-center mb-12"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center space-x-4 mb-4">
                  <img 
                    src="/logoW.png" 
                    alt="WooWStudio" 
                    className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 object-contain drop-shadow-xl"
                  />
                  <div className="flex flex-col">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                      <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        WooW
                      </span>
                      <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Studio
                      </span>
                    </h1>
                    <p className="text-sm md:text-base lg:text-lg text-slate-600 dark:text-slate-400 font-medium">
                      Create. Connect. Go.
                    </p>
                  </div>
                </div>
              </motion.div>
              
              {/*<motion.h1 
                className="text-5xl lg:text-7xl font-bold tracking-tight mb-6"
                variants={itemVariants}
              >
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Hello, Workflow!
                </span>
              </motion.h1>*/}
              
              <motion.p 
                className="text-xl lg:text-2xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto"
                variants={itemVariants}
              >
                Welcome to the future of workflow automation. 
                <span className="font-semibold text-blue-600 dark:text-blue-400"> Streamline</span>, 
                <span className="font-semibold text-purple-600 dark:text-purple-400"> automate</span>, and 
                <span className="font-semibold text-pink-600 dark:text-pink-400"> scale</span> your business processes like never before.
              </motion.p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
              variants={itemVariants}
            >
              <Link to="/dashboard">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
                >
                  <Rocket className="h-5 w-5 mr-2" />
                  Get Started
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link to="/workflows">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-2 border-blue-500/20 hover:border-blue-500/40 hover:bg-blue-500/5 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  <PlayCircle className="h-5 w-5 mr-2" />
                  Explore Workflows
                </Button>
              </Link>
            </motion.div>

            {/* Stats - Commented out */}
            {/*
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
              variants={itemVariants}
            >
              {stats.map((stat) => (
                <motion.div
                  key={stat.label}
                  className="text-center"
                  whileHover={{ y: -5 }}
                >
                  <div className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
            */}
          </div>
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div 
        className="px-6 py-20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            variants={itemVariants}
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              Why Choose Our Workflow Platform?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Experience the power of modern workflow automation with cutting-edge features designed for the digital age.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group"
              >
                <Card className="border-blue-500/20 dark:border-blue-400/20 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl hover:shadow-2xl transition-all duration-300 group-hover:border-blue-500/40">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 dark:text-white">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Call to Action */}
      <motion.div 
        className="px-6 py-20 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/5 dark:to-purple-500/5"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.div variants={itemVariants}>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Ready to Transform Your Workflows?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
              Join thousands of organizations already automating their processes with our platform.
            </p>
            <Link to="/dashboard">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
              >
                <TrendingUp className="h-5 w-5 mr-2" />
                Start Your Journey
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
} 