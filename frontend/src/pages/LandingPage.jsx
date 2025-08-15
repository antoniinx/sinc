import { Link } from 'react-router-dom'
import { Calendar, Users, Bell, Shield, Zap, Star, CheckCircle, ArrowRight, Menu, X } from 'lucide-react'
import { useState } from 'react'

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-2 animate-pulse"></span>
              Nová verze 2.0 je zde!
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Plánujte události
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                společně
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              Sdílený kalendář SINC pro skupiny, rodiny a týmy. Vytvářejte události, 
              koordinujte účast a zůstaňte vždy informováni o důležitých akcích.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                to="/register"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Začít zdarma
                <ArrowRight className="inline ml-2 w-5 h-5" />
              </Link>
              <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-200">
                Zobrazit demo
              </button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">10,000+</div>
                <div className="text-gray-600">Spokojených uživatelů</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">50,000+</div>
                <div className="text-gray-600">Vytvořených událostí</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">99.9%</div>
                <div className="text-gray-600">Dostupnost služby</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Hero Image */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-3xl transform rotate-1"></div>
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-200 relative">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-gray-700">Rodina</span>
                    </div>
                    <div className="space-y-2">
                      <div className="bg-blue-100 rounded-lg p-3 shadow-sm">
                        <div className="text-sm font-medium">Narozeniny mámy</div>
                        <div className="text-xs text-gray-600">15. prosince, 18:00</div>
                      </div>
                      <div className="bg-green-100 rounded-lg p-3 shadow-sm">
                        <div className="text-sm font-medium">Vánoční večeře</div>
                        <div className="text-xs text-gray-600">24. prosince, 17:00</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-gray-700">Tým</span>
                    </div>
                    <div className="space-y-2">
                      <div className="bg-purple-100 rounded-lg p-3 shadow-sm">
                        <div className="text-sm font-medium">Týmová porada</div>
                        <div className="text-xs text-gray-600">Zítra, 10:00</div>
                      </div>
                      <div className="bg-orange-100 rounded-lg p-3 shadow-sm">
                        <div className="text-sm font-medium">Deadline projektu</div>
                        <div className="text-xs text-gray-600">30. listopadu</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-gray-700">Přátelé</span>
                    </div>
                    <div className="space-y-2">
                      <div className="bg-green-100 rounded-lg p-3 shadow-sm">
                        <div className="text-sm font-medium">Večer s přáteli</div>
                        <div className="text-xs text-gray-600">Sobota, 19:00</div>
                      </div>
                      <div className="bg-red-100 rounded-lg p-3 shadow-sm">
                        <div className="text-sm font-medium">Fotbal</div>
                        <div className="text-xs text-gray-600">Neděle, 15:00</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium mb-4">
              <CheckCircle className="w-4 h-4 mr-2" />
              Všechny funkce zdarma
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Vše, co potřebujete pro organizaci událostí
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Jednoduchý a intuitivní nástroj pro plánování a koordinaci všech vašich aktivit
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all duration-300 transform hover:scale-105">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Skupiny a kontakty</h3>
              <p className="text-gray-600 leading-relaxed">
                Vytvářejte skupiny pro rodinu, přátele nebo tým. Přidávejte kontakty a spravujte je na jednom místě.
              </p>
            </div>
            
            <div className="group text-center p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 transition-all duration-300 transform hover:scale-105">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Calendar className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Sdílený kalendář</h3>
              <p className="text-gray-600 leading-relaxed">
                Sdílejte kalendáře s celou skupinou. Všichni vidí události a mohou se k nim vyjádřit.
              </p>
            </div>
            
            <div className="group text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 transition-all duration-300 transform hover:scale-105">
              <div className="w-20 h-20 bg-gradient-to-r from-green-600 to-green-700 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Bell className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Notifikace</h3>
              <p className="text-gray-600 leading-relaxed">
                Dostávejte upozornění na nové události, změny a komentáře. Nikdy nezmeškáte důležitou informaci.
              </p>
            </div>
            
            <div className="group text-center p-8 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 transition-all duration-300 transform hover:scale-105">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-600 to-orange-700 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Bezpečnost</h3>
              <p className="text-gray-600 leading-relaxed">
                Vaše data jsou v bezpečí. Šifrované připojení a bezpečná autentizace pro všechny uživatele.
              </p>
            </div>
            
            <div className="group text-center p-8 rounded-2xl bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 transition-all duration-300 transform hover:scale-105">
              <div className="w-20 h-20 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Rychlost</h3>
              <p className="text-gray-600 leading-relaxed">
                Rychlé načítání a intuitivní rozhraní. Vytvářejte události během několika sekund.
              </p>
            </div>
            
            <div className="group text-center p-8 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 transition-all duration-300 transform hover:scale-105">
              <div className="w-20 h-20 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Účast</h3>
              <p className="text-gray-600 leading-relaxed">
                Sledujte, kdo se účastní událostí. Ano, možná, ne - jasné odpovědi pro lepší plánování.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Co říkají naši uživatelé
            </h2>
            <p className="text-xl text-gray-600">
              Spokojení uživatelé z celé České republiky
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center mb-6">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                "Perfektní nástroj pro organizaci rodinných akcí. Konečně víme, kdy má kdo čas a můžeme plánovat společně."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                  MK
                </div>
                <div className="ml-4">
                  <div className="font-semibold text-gray-900">Marie Kováčová</div>
                  <div className="text-sm text-gray-500">Maminka 3 dětí</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center mb-6">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                "Jako manažer týmu ocením, jak snadno můžeme koordinovat schůzky a projektové termíny."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  PN
                </div>
                <div className="ml-4">
                  <div className="font-semibold text-gray-900">Petr Novák</div>
                  <div className="text-sm text-gray-500">Projektový manažer</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center mb-6">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                "Skvělý způsob, jak zůstat v kontaktu s přáteli. Plánujeme společné akce mnohem efektivněji."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                  JS
                </div>
                <div className="ml-4">
                  <div className="font-semibold text-gray-900">Jana Svobodová</div>
                  <div className="text-sm text-gray-500">Studentka</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Začněte plánovat společně ještě dnes
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 mb-10 leading-relaxed">
            Registrace je zdarma a trvá jen několik sekund. 
            Připojte se k tisícům spokojených uživatelů.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              to="/register"
              className="bg-white text-blue-600 px-10 py-5 rounded-2xl text-xl font-semibold hover:bg-gray-100 transition-all duration-200 shadow-2xl hover:shadow-3xl transform hover:scale-105"
            >
              Vytvořit účet zdarma
              <ArrowRight className="inline ml-3 w-6 h-6" />
            </Link>
            <Link
              to="/login"
              className="border-2 border-white text-white px-10 py-5 rounded-2xl text-xl font-semibold hover:bg-white hover:text-blue-600 transition-all duration-200"
            >
              Přihlásit se
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">SINC</span>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6">
                Nejlepší nástroj pro sdílené plánování událostí a organizaci skupin.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6">Produkt</h3>
              <ul className="space-y-3 text-gray-400">
                <li><Link to="/features" className="hover:text-white transition-colors">Funkce</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">Ceník</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrace</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6">Podpora</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Nápověda</a></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Kontakt</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6">Společnost</h3>
              <ul className="space-y-3 text-gray-400">
                <li><Link to="/about" className="hover:text-white transition-colors">O nás</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Kariéra</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Právní informace</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 SINC. Všechna práva vyhrazena.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
