import { Link } from 'react-router-dom'
import { Calendar, Users, Bell, Shield, Zap, CheckCircle, ArrowRight, Menu, X, ArrowLeft, Star, Heart, Target, Award, Globe, Clock } from 'lucide-react'
import { useState } from 'react'

const AboutPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const team = [
    {
      name: 'Jan Novák',
      role: 'CEO & Zakladatel',
      image: null,
      bio: 'Více než 10 let zkušeností v oblasti produktového managementu a vývoje software.',
      initials: 'JN'
    },
    {
      name: 'Marie Svobodová',
      role: 'CTO',
      image: null,
      bio: 'Expertka na architekturu aplikací a bezpečnost s vášní pro inovativní technologie.',
      initials: 'MS'
    },
    {
      name: 'Petr Kováč',
      role: 'Head of Design',
      image: null,
      bio: 'Kreativní designér s více než 8 lety zkušeností v UX/UI designu.',
      initials: 'PK'
    },
    {
      name: 'Anna Dvořáková',
      role: 'Head of Marketing',
      image: null,
      bio: 'Marketingová specialistka s bohatými zkušenostmi v digitálním marketingu.',
      initials: 'AD'
    }
  ]

  const values = [
    {
      icon: <Heart className="w-8 h-8 text-red-500" />,
      title: 'Uživatelská zkušenost',
      description: 'Věříme, že technologie má být intuitivní a příjemná na používání.'
    },
    {
      icon: <Target className="w-8 h-8 text-blue-500" />,
      title: 'Inovace',
      description: 'Neustále hledáme nové způsoby, jak zlepšit organizaci událostí.'
    },
    {
      icon: <Shield className="w-8 h-8 text-green-500" />,
      title: 'Bezpečnost',
      description: 'Vaše data jsou pro nás prioritou. Zajišťujeme nejvyšší úroveň zabezpečení.'
    },
    {
      icon: <Users className="w-8 h-8 text-purple-500" />,
      title: 'Spolupráce',
      description: 'Věříme v sílu týmové práce a sdílení znalostí.'
    }
  ]

  const milestones = [
    {
      year: '2022',
      title: 'Založení společnosti',
      description: 'SINC byl založen s vizí zjednodušit organizaci událostí.'
    },
    {
      year: '2023',
      title: 'První verze aplikace',
      description: 'Spuštění beta verze s základními funkcemi pro sdílené kalendáře.'
    },
    {
      year: '2024',
      title: '10,000 uživatelů',
      description: 'Dosažení významného milníku - 10,000 spokojených uživatelů.'
    },
    {
      year: '2024',
      title: 'Verze 2.0',
      description: 'Spuštění nové verze s pokročilými funkcemi a vylepšeným designem.'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <img src="/favicon.svg" alt="SINC" className="w-8 h-8" />
              <span className="text-xl font-bold text-gray-900">SINC</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/features"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Funkce
              </Link>
              <Link
                to="/pricing"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Ceník
              </Link>
              <Link
                to="/about"
                className="text-blue-600 hover:text-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                O nás
              </Link>
              <Link
                to="/contact"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Kontakt
              </Link>
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Přihlásit se
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Registrovat se
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-600 hover:text-gray-900 p-2"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <div className="flex flex-col space-y-2">
                <Link
                  to="/features"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Funkce
                </Link>
                <Link
                  to="/pricing"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Ceník
                </Link>
                <Link
                  to="/about"
                  className="text-blue-600 hover:text-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  O nás
                </Link>
                <Link
                  to="/contact"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Kontakt
                </Link>
                <div className="pt-2 border-t border-gray-200">
                  <Link
                    to="/login"
                    className="block text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Přihlásit se
                  </Link>
                  <Link
                    to="/register"
                    className="block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 mt-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Registrovat se
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Link
              to="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zpět na hlavní stránku
            </Link>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              O společnosti
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                SINC
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Naše mise je zjednodušit organizaci událostí a pomoci lidem lépe koordinovat jejich čas.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Naše mise
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                V SINC věříme, že organizace událostí by měla být jednoduchá a příjemná. 
                Naše platforma pomáhá rodinám, přátelům a týmům lépe koordinovat jejich čas 
                a vytvářet nezapomenutelné zážitky.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Od roku 2022 pracujeme na tom, abychom vytvořili nejlepší nástroj pro sdílené 
                plánování událostí. Naše aplikace kombinuje jednoduchost používání s pokročilými 
                funkcemi, které potřebují moderní uživatelé.
              </p>
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">10,000+</div>
                  <div className="text-gray-600">Spokojených uživatelů</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">50,000+</div>
                  <div className="text-gray-600">Vytvořených událostí</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">99.9%</div>
                  <div className="text-gray-600">Dostupnost</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-3xl transform rotate-3"></div>
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 relative">
                <div className="text-center">
                  <Calendar className="w-24 h-24 text-blue-600 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Spojujeme lidi
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Naše technologie pomáhá lidem zůstat v kontaktu a vytvářet 
                    smysluplné vztahy prostřednictvím sdílených zážitků.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Naše hodnoty
            </h2>
            <p className="text-xl text-gray-600">
              Principy, které nás vedou v každém rozhodnutí
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300">
                <div className="flex justify-center mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Náš tým
            </h2>
            <p className="text-xl text-gray-600">
              Poznejte lidi, kteří stojí za SINC
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl hover:shadow-lg transition-shadow duration-300">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-xl font-bold">
                    {member.initials}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <p className="text-blue-600 font-medium mb-4">
                  {member.role}
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Naše cesta
            </h2>
            <p className="text-xl text-gray-600">
              Klíčové milníky v historii SINC
            </p>
          </div>

          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {milestone.year}
                    </span>
                  </div>
                </div>
                <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {milestone.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {milestone.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4">
            Připojte se k nám
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Začněte používat SINC a objevte, jak snadné může být organizování událostí
          </p>
          <Link
            to="/register"
            className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 inline-flex items-center"
          >
            Začít zdarma
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 SINC. Všechna práva vyhrazena.</p>
        </div>
      </footer>
    </div>
  )
}

export default AboutPage
