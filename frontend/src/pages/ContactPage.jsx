import { Link } from 'react-router-dom'
import { Calendar, Mail, Phone, MapPin, Clock, MessageSquare, Menu, X, ArrowLeft, Send, CheckCircle } from 'lucide-react'
import { useState } from 'react'

const ContactPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulace odeslání formuláře
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
      setFormData({ name: '', email: '', subject: '', message: '' })
    }, 2000)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const contactInfo = [
    {
      icon: <Mail className="w-6 h-6 text-blue-600" />,
      title: 'Email',
      value: 'info@eventsync.cz',
      description: 'Odpovíme do 24 hodin'
    },
    {
      icon: <Phone className="w-6 h-6 text-green-600" />,
      title: 'Telefon',
      value: '+420 123 456 789',
      description: 'Po-Pá 9:00-17:00'
    },
    {
      icon: <MapPin className="w-6 h-6 text-purple-600" />,
      title: 'Adresa',
      value: 'Václavské náměstí 1, Praha 1',
      description: 'Hlavní kancelář'
    },
    {
      icon: <Clock className="w-6 h-6 text-orange-600" />,
      title: 'Pracovní doba',
      value: 'Po-Pá 9:00-17:00',
      description: 'So-Ne zavřeno'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">EventSync</span>
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
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                O nás
              </Link>
              <Link
                to="/contact"
                className="text-blue-600 hover:text-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
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
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  O nás
                </Link>
                <Link
                  to="/contact"
                  className="text-blue-600 hover:text-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
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
              Kontaktujte nás
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Máte otázky nebo potřebujete pomoct? Jsme tu pro vás a rádi vám pomůžeme.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {contactInfo.map((info, index) => (
              <div key={index} className="text-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl hover:shadow-lg transition-shadow duration-300">
                <div className="flex justify-center mb-4">
                  {info.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {info.title}
                </h3>
                <p className="text-gray-900 font-medium mb-1">
                  {info.value}
                </p>
                <p className="text-gray-600 text-sm">
                  {info.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Napište nám
            </h2>
            <p className="text-xl text-gray-600">
              Vyplňte formulář a my se vám ozveme co nejdříve
            </p>
          </div>

          {isSubmitted ? (
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Děkujeme za zprávu!
              </h3>
              <p className="text-gray-600 mb-6">
                Vaše zpráva byla úspěšně odeslána. Ozveme se vám do 24 hodin.
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Odeslat další zprávu
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Jméno *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Vaše jméno"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="vas@email.cz"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Předmět *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="O čem se chcete zeptat?"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Zpráva *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                    placeholder="Napište nám svou zprávu..."
                  />
                </div>
                
                <div className="text-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Odesílání...
                      </>
                    ) : (
                      <>
                        Odeslat zprávu
                        <Send className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Často kladené otázky
            </h2>
            <p className="text-xl text-gray-600">
              Odpovědi na nejčastější otázky
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Jak dlouho trvá odpověď na email?
              </h3>
              <p className="text-gray-600">
                Snažíme se odpovídat na všechny emaily do 24 hodin. V pracovní dny obvykle odpovíme do několika hodin.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Poskytujete technickou podporu?
              </h3>
              <p className="text-gray-600">
                Ano, poskytujeme technickou podporu pro všechny uživatele. Můžete nás kontaktovat emailem nebo telefonicky.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Nabízíte školení pro firmy?
              </h3>
              <p className="text-gray-600">
                Ano, nabízíme školení a onboarding pro firmy. Kontaktujte nás pro více informací o našich službách.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Jak mohu nahlásit chybu v aplikaci?
              </h3>
              <p className="text-gray-600">
                Chyby můžete nahlásit přes kontaktní formulář nebo emailem na support@eventsync.cz. Uvítáme také screenshoty.
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
            Registrace je zdarma a můžete začít používat EventSync okamžitě
          </p>
          <Link
            to="/register"
            className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 inline-flex items-center"
          >
            Začít zdarma
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 EventSync. Všechna práva vyhrazena.</p>
        </div>
      </footer>
    </div>
  )
}

export default ContactPage
