import { Link } from 'react-router-dom'
import { Calendar, Users, Bell, Shield, Zap, CheckCircle, ArrowRight, Menu, X, ArrowLeft, Star, Crown, Zap as ZapIcon } from 'lucide-react'
import { useState } from 'react'

const PricingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [billingCycle, setBillingCycle] = useState('monthly')

  const plans = [
    {
      name: 'Free',
      price: { monthly: 0, yearly: 0 },
      description: 'Perfektní pro začátečníky a malé skupiny',
      features: [
        'Neomezené skupiny',
        'Neomezené události',
        'Základní notifikace',
        'Mobilní aplikace',
        'Základní podpora',
        '5 členů na skupinu'
      ],
      popular: false,
      color: 'blue'
    },
    {
      name: 'Pro',
      price: { monthly: 299, yearly: 2990 },
      description: 'Ideální pro aktivní uživatele a týmy',
      features: [
        'Vše z Free plánu',
        'Neomezené členy ve skupinách',
        'Pokročilé notifikace',
        'Export do kalendáře',
        'Prioritní podpora',
        'Analytika účasti',
        'Vlastní barvy skupin',
        'Zálohování dat'
      ],
      popular: true,
      color: 'purple'
    },
    {
      name: 'Enterprise',
      price: { monthly: 799, yearly: 7990 },
      description: 'Pro velké organizace a firmy',
      features: [
        'Vše z Pro plánu',
        'API přístup',
        'SSO integrace',
        'Dedikovaný manažer',
        'Školení a onboarding',
        'Vlastní branding',
        '99.9% SLA',
        '24/7 podpora'
      ],
      popular: false,
      color: 'green'
    }
  ]

  const getColorClasses = (color) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600',
      purple: 'from-purple-500 to-purple-600',
      green: 'from-green-500 to-green-600'
    }
    return colors[color] || colors.blue
  }

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
                className="text-blue-600 hover:text-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Ceník
              </Link>
              <Link
                to="/about"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
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
                  className="text-blue-600 hover:text-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Ceník
                </Link>
                <Link
                  to="/about"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
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
              Jednoduché a transparentní
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                cenové plány
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Vyberte si plán, který nejlépe vyhovuje vašim potřebám. Všechny plány zahrnují naše základní funkce.
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center space-x-4 mb-12">
              <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
                Měsíčně
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  billingCycle === 'yearly' ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
                Ročně
                <span className="ml-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Ušetříte 20%
                </span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 ${
                  plan.popular
                    ? 'ring-2 ring-purple-500 bg-gradient-to-br from-purple-50 to-purple-100'
                    : 'bg-white border border-gray-200'
                } hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Nejoblíbenější
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  
                  <div className="mb-6">
                    {plan.price[billingCycle] === 0 ? (
                      <div className="text-4xl font-bold text-gray-900">Zdarma</div>
                    ) : (
                      <div>
                        <div className="text-4xl font-bold text-gray-900">
                          {plan.price[billingCycle]} Kč
                        </div>
                        <div className="text-gray-500">
                          {billingCycle === 'monthly' ? 'měsíčně' : 'ročně'}
                        </div>
                      </div>
                    )}
                  </div>

                  <Link
                    to={plan.name === 'Free' ? '/register' : '/contact'}
                    className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {plan.name === 'Free' ? 'Začít zdarma' : 'Kontaktovat'}
                  </Link>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 mb-4">Co je zahrnuto:</h4>
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Často kladené otázky
            </h2>
            <p className="text-xl text-gray-600">
              Odpovědi na nejčastější otázky o našich cenových plánech
            </p>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Mohu změnit plán kdykoliv?
              </h3>
              <p className="text-gray-600">
                Ano, můžete změnit svůj plán kdykoliv. Změny se projeví od dalšího fakturačního období.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Je možné zrušit předplatné?
              </h3>
              <p className="text-gray-600">
                Ano, můžete zrušit předplatné kdykoliv. Vaše data zůstanou zachována po dobu 30 dnů.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Jaké platební metody přijímáte?
              </h3>
              <p className="text-gray-600">
                Přijímáme všechny hlavní platební karty (Visa, Mastercard), PayPal a bankovní převod.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Je možné vyzkoušet placené plány zdarma?
              </h3>
              <p className="text-gray-600">
                Ano, nabízíme 14denní zkušební verzi všech placených plánů bez závazků.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4">
            Začněte ještě dnes
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Registrace je zdarma a můžete začít používat všechny základní funkce okamžitě
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 inline-flex items-center justify-center"
            >
              Začít zdarma
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              to="/contact"
              className="border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-200"
            >
              Kontaktovat prodej
            </Link>
          </div>
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

export default PricingPage
