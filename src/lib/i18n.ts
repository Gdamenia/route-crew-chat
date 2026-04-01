export type SupportedLanguage = 'en' | 'ru' | 'ka' | 'es' | 'uk' | 'pl' | 'hi' | 'am';

const translations: Record<string, Record<SupportedLanguage, string>> = {
  // Nav
  'nav.map': { en: 'Map', ru: 'Карта', ka: 'რუკა', es: 'Mapa', uk: 'Карта', pl: 'Mapa', hi: 'नक्शा', am: 'ካርታ' },
  'nav.channels': { en: 'Channels', ru: 'Каналы', ka: 'არხები', es: 'Canales', uk: 'Канали', pl: 'Kanały', hi: 'चैनल', am: 'ቻናሎች' },
  'nav.messages': { en: 'Messages', ru: 'Сообщения', ka: 'შეტყობინებები', es: 'Mensajes', uk: 'Повідомлення', pl: 'Wiadomości', hi: 'संदेश', am: 'መልዕክቶች' },
  'nav.profile': { en: 'Profile', ru: 'Профиль', ka: 'პროფილი', es: 'Perfil', uk: 'Профіль', pl: 'Profil', hi: 'प्रोफ़ाइल', am: 'መገለጫ' },

  // Status
  'status.available': { en: 'Available', ru: 'Доступен', ka: 'ხელმისაწვდომი', es: 'Disponible', uk: 'Доступний', pl: 'Dostępny', hi: 'उपलब्ध', am: 'ዝግጁ' },
  'status.driving': { en: 'Driving', ru: 'В пути', ka: 'მგზავრობაში', es: 'Conduciendo', uk: 'В дорозі', pl: 'W trasie', hi: 'ड्राइविंग', am: 'በመንዳት ላይ' },
  'status.resting': { en: 'Resting', ru: 'Отдыхает', ka: 'ისვენებს', es: 'Descansando', uk: 'Відпочиває', pl: 'Odpoczynek', hi: 'आराम', am: 'ዕረፍት' },
  'status.dnd': { en: 'Do Not Disturb', ru: 'Не беспокоить', ka: 'არ შემაწუხოთ', es: 'No molestar', uk: 'Не турбувати', pl: 'Nie przeszkadzać', hi: 'परेशान न करें', am: 'አትረብሹ' },

  // Auth
  'auth.signIn': { en: 'Sign In', ru: 'Войти', ka: 'შესვლა', es: 'Iniciar sesión', uk: 'Увійти', pl: 'Zaloguj się', hi: 'साइन इन', am: 'ግባ' },
  'auth.signUp': { en: 'Create Account', ru: 'Создать аккаунт', ka: 'ანგარიშის შექმნა', es: 'Crear cuenta', uk: 'Створити акаунт', pl: 'Utwórz konto', hi: 'खाता बनाएं', am: 'መለያ ፍጠር' },
  'auth.signOut': { en: 'Sign Out', ru: 'Выйти', ka: 'გამოსვლა', es: 'Cerrar sesión', uk: 'Вийти', pl: 'Wyloguj', hi: 'साइन आउट', am: 'ውጣ' },
  'auth.email': { en: 'Email', ru: 'Эл. почта', ka: 'ელ.ფოსტა', es: 'Correo', uk: 'Ел. пошта', pl: 'E-mail', hi: 'ईमेल', am: 'ኢሜይል' },
  'auth.password': { en: 'Password', ru: 'Пароль', ka: 'პაროლი', es: 'Contraseña', uk: 'Пароль', pl: 'Hasło', hi: 'पासवर्ड', am: 'የይለፍ ቃል' },
  'auth.confirmPassword': { en: 'Confirm Password', ru: 'Подтвердите пароль', ka: 'პაროლის დადასტურება', es: 'Confirmar contraseña', uk: 'Підтвердіть пароль', pl: 'Potwierdź hasło', hi: 'पासवर्ड की पुष्टि', am: 'የይለፍ ቃል አረጋግጥ' },
  'auth.welcomeBack': { en: 'Welcome back, driver.', ru: 'С возвращением, водитель.', ka: 'კეთილი იყოს შენი დაბრუნება.', es: 'Bienvenido de nuevo, conductor.', uk: 'З поверненням, водій.', pl: 'Witaj ponownie, kierowco.', hi: 'वापसी पर स्वागत है, ड्राइवर।', am: 'እንኳን ደህና መጣህ ሹፌር።' },
  'auth.joinNetwork': { en: 'Join the driver network.', ru: 'Присоединяйтесь к сети водителей.', ka: 'შეუერთდით მძღოლთა ქსელს.', es: 'Únete a la red de conductores.', uk: 'Приєднуйтесь до мережі водіїв.', pl: 'Dołącz do sieci kierowców.', hi: 'ड्राइवर नेटवर्क से जुड़ें।', am: 'የሹፌሮች ኔትወርክ ይቀላቀሉ።' },
  'auth.noAccount': { en: "Don't have an account?", ru: 'Нет аккаунта?', ka: 'არ გაქვთ ანგარიში?', es: '¿No tienes cuenta?', uk: 'Немає акаунту?', pl: 'Nie masz konta?', hi: 'खाता नहीं है?', am: 'መለያ የለህም?' },
  'auth.hasAccount': { en: 'Already have an account?', ru: 'Уже есть аккаунт?', ka: 'უკვე გაქვთ ანგარიში?', es: '¿Ya tienes cuenta?', uk: 'Вже маєте акаунт?', pl: 'Masz już konto?', hi: 'पहले से खाता है?', am: 'ቀድሞ መለያ አለህ?' },
  'auth.passwordMismatch': { en: 'Passwords do not match', ru: 'Пароли не совпадают', ka: 'პაროლები არ ემთხვევა', es: 'Las contraseñas no coinciden', uk: 'Паролі не збігаються', pl: 'Hasła nie pasują', hi: 'पासवर्ड मेल नहीं खाते', am: 'የይለፍ ቃሎች አይዛመዱም' },
  'auth.passwordLength': { en: 'Password must be at least 6 characters', ru: 'Пароль должен быть не менее 6 символов', ka: 'პაროლი უნდა იყოს მინიმუმ 6 სიმბოლო', es: 'La contraseña debe tener al menos 6 caracteres', uk: 'Пароль повинен містити щонайменше 6 символів', pl: 'Hasło musi mieć co najmniej 6 znaków', hi: 'पासवर्ड कम से कम 6 अक्षर का होना चाहिए', am: 'የይለፍ ቃል ቢያንስ 6 ፊደላት መሆን አለበት' },
  'auth.back': { en: 'Back', ru: 'Назад', ka: 'უკან', es: 'Atrás', uk: 'Назад', pl: 'Wstecz', hi: 'वापस', am: 'ተመለስ' },

  // Onboarding
  'onboarding.title': { en: 'RouteLink', ru: 'RouteLink', ka: 'RouteLink', es: 'RouteLink', uk: 'RouteLink', pl: 'RouteLink', hi: 'RouteLink', am: 'RouteLink' },
  'onboarding.subtitle': { en: 'Connect with drivers on your route', ru: 'Свяжитесь с водителями на вашем маршруте', ka: 'დაუკავშირდით მძღოლებს თქვენს მარშრუტზე', es: 'Conéctate con conductores en tu ruta', uk: "Зв'яжіться з водіями на вашому маршруті", pl: 'Połącz się z kierowcami na trasie', hi: 'अपने रूट पर ड्राइवरों से जुड़ें', am: 'በመንገድዎ ላይ ከሹፌሮች ጋር ይገናኙ' },
  'onboarding.getStarted': { en: 'Get Started', ru: 'Начать', ka: 'დაწყება', es: 'Comenzar', uk: 'Почати', pl: 'Rozpocznij', hi: 'शुरू करें', am: 'ጀምር' },
  'onboarding.alreadyDriver': { en: 'Already a driver? Sign In', ru: 'Уже водитель? Войти', ka: 'უკვე მძღოლი ხართ? შესვლა', es: '¿Ya eres conductor? Inicia sesión', uk: 'Вже водій? Увійти', pl: 'Już jesteś kierowcą? Zaloguj', hi: 'पहले से ड्राइवर हैं? साइन इन करें', am: 'ቀድሞ ሹፌር ነህ? ግባ' },
  'onboarding.feature1': { en: "See who's on your route right now", ru: 'Узнайте, кто сейчас на вашем маршруте', ka: 'ნახეთ ვინ არის თქვენს მარშრუტზე', es: 'Ve quién está en tu ruta ahora', uk: 'Дивіться хто зараз на вашому маршруті', pl: 'Zobacz kto jest na trasie', hi: 'देखें कि अभी आपके रूट पर कौन है', am: 'አሁን በመንገድዎ ላይ ማን እንዳለ ይመልከቱ' },
  'onboarding.feature2': { en: 'Real-time route channels & chat', ru: 'Чаты маршрутов в реальном времени', ka: 'რეალურ დროში მარშრუტის არხები და ჩატი', es: 'Canales de ruta y chat en tiempo real', uk: 'Канали маршруту та чат в реальному часі', pl: 'Kanały tras i czat na żywo', hi: 'रीयल-टाइम रूट चैनल और चैट', am: 'በቅጽበት የመንገድ ቻናሎች እና ቻት' },
  'onboarding.feature3': { en: 'Voice rooms for your highway', ru: 'Голосовые комнаты для вашей трассы', ka: 'ხმოვანი ოთახები თქვენი მაგისტრალისთვის', es: 'Salas de voz para tu autopista', uk: 'Голосові кімнати для вашої траси', pl: 'Pokoje głosowe dla twojej trasy', hi: 'आपके हाइवे के लिए वॉयस रूम', am: 'ለአውራ ጎዳናዎ የድምፅ ክፍሎች' },

  // Onboarding carousel
  'onboarding.s1.title': { en: 'Never drive alone', ru: 'Никогда не ездите один', ka: 'არასდროს იმგზავრო მარტო', es: 'Nunca conduzcas solo', uk: 'Ніколи не їдь сам', pl: 'Nigdy nie jedź sam', hi: 'कभी अकेले न चलाएं', am: 'ብቻህን አትንዳ' },
  'onboarding.s1.text': { en: 'Connect with drivers on your exact route in real time.', ru: 'Связывайтесь с водителями на вашем маршруте в реальном времени.', ka: 'რეალურ დროში დაუკავშირდით მძღოლებს თქვენს ზუსტ მარშრუტზე.', es: 'Conéctate con conductores en tu ruta exacta en tiempo real.', uk: "Зв'язуйтесь з водіями на вашому маршруті в реальному часі.", pl: 'Połącz się z kierowcami na twojej trasie w czasie rzeczywistym.', hi: 'रीयल टाइम में अपने सटीक रूट पर ड्राइवरों से जुड़ें।', am: 'በቅጽበት በትክክለኛ መንገድዎ ላይ ከሹፌሮች ጋር ይገናኙ።' },
  'onboarding.s2.title': { en: 'Your language, your crew', ru: 'Ваш язык, ваша команда', ka: 'თქვენი ენა, თქვენი გუნდი', es: 'Tu idioma, tu equipo', uk: 'Твоя мова, твоя команда', pl: 'Twój język, twoja ekipa', hi: 'आपकी भाषा, आपकी टीम', am: 'ቋንቋህ ቡድንህ' },
  'onboarding.s2.text': { en: 'Chat in English, Russian, Georgian, Spanish, and more. Find drivers who speak your language.', ru: 'Общайтесь на английском, русском, грузинском, испанском и других языках.', ka: 'ისაუბრეთ ინგლისურად, რუსულად, ქართულად, ესპანურად და სხვა.', es: 'Chatea en inglés, ruso, georgiano, español y más. Encuentra conductores que hablen tu idioma.', uk: 'Спілкуйтесь англійською, російською, грузинською, іспанською та іншими мовами.', pl: 'Rozmawiaj po angielsku, rosyjsku, gruzińsku, hiszpańsku i nie tylko.', hi: 'अंग्रेजी, रूसी, जॉर्जियन, स्पेनिश और अन्य भाषाओं में चैट करें।', am: 'በእንግሊዝኛ በሩሲያኛ በጆርጂያኛ በስፓኒሽ እና በሌሎችም ቋንቋዎች ያወሩ።' },
  'onboarding.s3.title': { en: "Voice when you can't type", ru: 'Голос, когда не можете печатать', ka: 'ხმა, როცა ვერ წერთ', es: 'Voz cuando no puedes escribir', uk: 'Голос, коли не можеш писати', pl: 'Głos, gdy nie możesz pisać', hi: 'जब टाइप न कर सकें तो आवाज़', am: 'መጻፍ ሳትችል ድምፅ' },
  'onboarding.s3.text': { en: 'Send voice messages, join voice rooms, and stay hands-free on the road.', ru: 'Отправляйте голосовые сообщения и оставайтесь свободными за рулём.', ka: 'გაგზავნეთ ხმოვანი შეტყობინებები და დარჩით თავისუფალი გზაზე.', es: 'Envía mensajes de voz, únete a salas de voz y mantén las manos libres.', uk: 'Надсилайте голосові повідомлення та залишайтеся вільними за кермом.', pl: 'Wysyłaj wiadomości głosowe i bądź wolny na drodze.', hi: 'वॉयस मैसेज भेजें, वॉयस रूम में शामिल हों और हैंड्स-फ्री रहें।', am: 'የድምፅ መልዕክቶች ላኩ የድምፅ ክፍሎች ይቀላቀሉ።' },
  'onboarding.next': { en: 'Next', ru: 'Далее', ka: 'შემდეგი', es: 'Siguiente', uk: 'Далі', pl: 'Dalej', hi: 'अगला', am: 'ቀጣይ' },

  // Chat
  'chat.message': { en: 'Message...', ru: 'Сообщение...', ka: 'შეტყობინება...', es: 'Mensaje...', uk: 'Повідомлення...', pl: 'Wiadomość...', hi: 'संदेश...', am: 'መልዕክት...' },
  'chat.send': { en: 'Send', ru: 'Отправить', ka: 'გაგზავნა', es: 'Enviar', uk: 'Надіслати', pl: 'Wyślij', hi: 'भेजें', am: 'ላክ' },
  'chat.noMessages': { en: 'No messages yet. Be the first!', ru: 'Сообщений пока нет. Будьте первым!', ka: 'ჯერ შეტყობინებები არ არის. იყავით პირველი!', es: '¡Aún no hay mensajes. Sé el primero!', uk: 'Поки що немає повідомлень. Будьте першим!', pl: 'Brak wiadomości. Bądź pierwszy!', hi: 'अभी तक कोई संदेश नहीं। पहले बनें!', am: 'ገና መልዕክቶች የሉም። የመጀመሪያው ሁን!' },
  'chat.sendFailed': { en: 'Message failed to send. Check your connection and try again.', ru: 'Не удалось отправить. Проверьте подключение.', ka: 'გაგზავნა ვერ მოხერხდა. შეამოწმეთ კავშირი.', es: 'Error al enviar. Verifica tu conexión.', uk: 'Не вдалося надіслати. Перевірте підключення.', pl: 'Wysyłanie nieudane. Sprawdź połączenie.', hi: 'संदेश भेजने में विफल। कनेक्शन जांचें।', am: 'መልዕክት መላክ አልተሳካም። ግንኙነትዎን ያረጋግጡ።' },
  'chat.loadFailed': { en: 'Failed to load messages. Please try again.', ru: 'Не удалось загрузить сообщения.', ka: 'შეტყობინებების ჩატვირთვა ვერ მოხერხდა.', es: 'Error al cargar mensajes.', uk: 'Не вдалося завантажити повідомлення.', pl: 'Nie udało się załadować wiadomości.', hi: 'संदेश लोड करने में विफल।', am: 'መልዕክቶችን መጫን አልተሳካም።' },
  'chat.24hBanner': { en: 'Showing messages from the last 24 hours', ru: 'Показаны сообщения за последние 24 часа', ka: 'ნაჩვენებია ბოლო 24 საათის შეტყობინებები', es: 'Mostrando mensajes de las últimas 24 horas', uk: 'Показані повідомлення за останні 24 години', pl: 'Wiadomości z ostatnich 24 godzin', hi: 'पिछले 24 घंटों के संदेश दिखा रहे हैं', am: 'ባለፉት 24 ሰዓታት ውስጥ ያሉ መልዕክቶች' },
  'chat.retry': { en: 'Retry', ru: 'Повторить', ka: 'ხელახლა', es: 'Reintentar', uk: 'Повторити', pl: 'Ponów', hi: 'पुनः प्रयास', am: 'ድገም' },
  'chat.sending': { en: 'Sending...', ru: 'Отправка...', ka: 'იგზავნება...', es: 'Enviando...', uk: 'Надсилання...', pl: 'Wysyłanie...', hi: 'भेज रहे हैं...', am: 'በመላክ ላይ...' },
  'chat.liveChannel': { en: 'Live Channel', ru: 'Живой канал', ka: 'პირდაპირი არხი', es: 'Canal en vivo', uk: 'Живий канал', pl: 'Kanał na żywo', hi: 'लाइव चैनल', am: 'ቀጥታ ቻናል' },
  'chat.startConversation': { en: 'Send a message to start the conversation', ru: 'Отправьте сообщение, чтобы начать беседу', ka: 'გაგზავნეთ შეტყობინება საუბრის დასაწყებად', es: 'Envía un mensaje para iniciar la conversación', uk: 'Надішліть повідомлення, щоб почати розмову', pl: 'Wyślij wiadomość, aby rozpocząć rozmowę', hi: 'बातचीत शुरू करने के लिए संदेश भेजें', am: 'ውይይት ለመጀመር መልዕክት ላኩ' },
  'chat.deliveredSilently': { en: 'Message (delivered silently)...', ru: 'Сообщение (тихая доставка)...', ka: 'შეტყობინება (ჩუმად მიწოდებული)...', es: 'Mensaje (entrega silenciosa)...', uk: 'Повідомлення (тиха доставка)...', pl: 'Wiadomość (cicha dostawa)...', hi: 'संदेश (चुपचाप डिलीवर)...', am: 'መልዕክት (በዝምታ የተላከ)...' },
  'chat.dndBanner': { en: 'This driver is on DND. Your message will be delivered silently.', ru: 'Этот водитель на DND. Ваше сообщение будет доставлено беззвучно.', ka: 'ეს მძღოლი DND-ზეა. თქვენი შეტყობინება ჩუმად მიეწოდება.', es: 'Este conductor está en No molestar. Tu mensaje se entregará en silencio.', uk: 'Цей водій на DND. Ваше повідомлення буде доставлено беззвучно.', pl: 'Ten kierowca jest na DND. Twoja wiadomość zostanie dostarczona cicho.', hi: 'यह ड्राइवर DND पर है। आपका संदेश चुपचाप डिलीवर होगा।', am: 'ይህ ሹፌር DND ላይ ነው። መልዕክትዎ በዝምታ ይደርሳል።' },

  // Channels
  'channels.title': { en: 'Route Channels', ru: 'Каналы маршрутов', ka: 'მარშრუტის არხები', es: 'Canales de ruta', uk: 'Канали маршрутів', pl: 'Kanały tras', hi: 'रूट चैनल', am: 'የመንገድ ቻናሎች' },
  'channels.myChannels': { en: 'My Channels', ru: 'Мои каналы', ka: 'ჩემი არხები', es: 'Mis canales', uk: 'Мої канали', pl: 'Moje kanały', hi: 'मेरे चैनल', am: 'የእኔ ቻናሎች' },
  'channels.allChannels': { en: 'All Channels', ru: 'Все каналы', ka: 'ყველა არხი', es: 'Todos los canales', uk: 'Всі канали', pl: 'Wszystkie kanały', hi: 'सभी चैनल', am: 'ሁሉም ቻናሎች' },
  'channels.join': { en: 'Join', ru: 'Вступить', ka: 'გაწევრიანება', es: 'Unirse', uk: 'Приєднатися', pl: 'Dołącz', hi: 'जुड़ें', am: 'ተቀላቀል' },
  'channels.leave': { en: 'Leave', ru: 'Выйти', ka: 'დატოვება', es: 'Salir', uk: 'Вийти', pl: 'Opuść', hi: 'छोड़ें', am: 'ውጣ' },
  'channels.openChat': { en: 'Open Chat', ru: 'Открыть чат', ka: 'ჩატის გახსნა', es: 'Abrir chat', uk: 'Відкрити чат', pl: 'Otwórz czat', hi: 'चैट खोलें', am: 'ቻት ክፈት' },
  'channels.noJoined': { en: 'No channels joined yet.', ru: 'Вы ещё не подключены к каналам.', ka: 'ჯერ არცერთ არხში არ ხართ.', es: 'Aún no te has unido a canales.', uk: 'Ви ще не приєднались до каналів.', pl: 'Nie dołączyłeś do żadnego kanału.', hi: 'अभी तक कोई चैनल नहीं जुड़ा।', am: 'ገና ምንም ቻናል አልተቀላቀሉም።' },
  'channels.noAvailable': { en: 'No channels available.', ru: 'Каналы не найдены.', ka: 'არხები არ არის.', es: 'No hay canales disponibles.', uk: 'Каналів немає.', pl: 'Brak dostępnych kanałów.', hi: 'कोई चैनल उपलब्ध नहीं।', am: 'ምንም ቻናል የለም።' },
  'channels.yourRoute': { en: '📍 Your route', ru: '📍 Ваш маршрут', ka: '📍 თქვენი მარშრუტი', es: '📍 Tu ruta', uk: '📍 Ваш маршрут', pl: '📍 Twoja trasa', hi: '📍 आपका रूट', am: '📍 መንገድዎ' },

  // DM
  'dm.noMessages': { en: 'No messages yet', ru: 'Сообщений пока нет', ka: 'ჯერ შეტყობინებები არ არის', es: 'Aún no hay mensajes', uk: 'Поки що немає повідомлень', pl: 'Brak wiadomości', hi: 'अभी तक कोई संदेश नहीं', am: 'ገና መልዕክቶች የሉም' },
  'dm.tapDriver': { en: 'Tap on a driver on the map to start a conversation', ru: 'Нажмите на водителя на карте, чтобы начать беседу', ka: 'დააჭირეთ მძღოლს რუკაზე საუბრის დასაწყებად', es: 'Toca un conductor en el mapa para iniciar conversación', uk: 'Натисніть на водія на карті, щоб почати розмову', pl: 'Kliknij kierowcę na mapie, aby rozpocząć rozmowę', hi: 'बातचीत शुरू करने के लिए मैप पर ड्राइवर पर टैप करें', am: 'ውይይት ለመጀመር ካርታ ላይ ሹፌር ንኩ' },

  // Profile
  'profile.title': { en: 'Profile', ru: 'Профиль', ka: 'პროფილი', es: 'Perfil', uk: 'Профіль', pl: 'Profil', hi: 'प्रोफ़ाइल', am: 'መገለጫ' },
  'profile.save': { en: 'Save Profile', ru: 'Сохранить', ka: 'შენახვა', es: 'Guardar', uk: 'Зберегти', pl: 'Zapisz', hi: 'सेव करें', am: 'አስቀምጥ' },
  'profile.displayName': { en: 'Display Name', ru: 'Имя', ka: 'სახელი', es: 'Nombre', uk: "Ім'я", pl: 'Nazwa', hi: 'प्रदर्शन नाम', am: 'ስም' },
  'profile.truckType': { en: 'Truck Type', ru: 'Тип грузовика', ka: 'სატვირთო ტიპი', es: 'Tipo de camión', uk: 'Тип вантажівки', pl: 'Typ ciężarówki', hi: 'ट्रक प्रकार', am: 'የመኪና ዓይነት' },
  'profile.bio': { en: 'Bio', ru: 'О себе', ka: 'შესახებ', es: 'Bio', uk: 'Про себе', pl: 'Bio', hi: 'बायो', am: 'ስለ እርስዎ' },
  'profile.driverStatus': { en: 'Driver Status', ru: 'Статус водителя', ka: 'მძღოლის სტატუსი', es: 'Estado del conductor', uk: 'Статус водія', pl: 'Status kierowcy', hi: 'ड्राइवर स्थिति', am: 'የሹፌር ሁኔታ' },
  'profile.visibility': { en: 'Visibility', ru: 'Видимость', ka: 'ხილვადობა', es: 'Visibilidad', uk: 'Видимість', pl: 'Widoczność', hi: 'दृश्यता', am: 'ታይነት' },
  'profile.settings': { en: 'Settings', ru: 'Настройки', ka: 'პარამეტრები', es: 'Ajustes', uk: 'Налаштування', pl: 'Ustawienia', hi: 'सेटिंग्स', am: 'ቅንብሮች' },
  'profile.language': { en: 'Language', ru: 'Язык', ka: 'ენა', es: 'Idioma', uk: 'Мова', pl: 'Język', hi: 'भाषा', am: 'ቋንቋ' },
  'profile.createTitle': { en: 'Create Your Profile', ru: 'Создайте профиль', ka: 'შექმენით პროფილი', es: 'Crea tu perfil', uk: 'Створіть профіль', pl: 'Utwórz profil', hi: 'अपना प्रोफ़ाइल बनाएं', am: 'መገለጫዎን ይፍጠሩ' },
  'profile.createSubtitle': { en: 'This is how other drivers will see you. Use a nickname if you prefer privacy.', ru: 'Так вас будут видеть другие водители. Используйте ник для конфиденциальности.', ka: 'სხვა მძღოლები ასე დაგინახავენ. გამოიყენეთ მეტსახელი.', es: 'Así te verán otros conductores. Usa un apodo si prefieres privacidad.', uk: 'Так вас бачитимуть інші водії. Використовуйте нік.', pl: 'Tak będą cię widzieć inni kierowcy. Użyj pseudonimu.', hi: 'इस तरह अन्य ड्राइवर आपको देखेंगे। निकनेम का उपयोग करें।', am: 'ሌሎች ሹፌሮች እንዲህ ያዩዎታል። ቅጽል ስም ይጠቀሙ።' },
  'profile.createButton': { en: 'Create Profile & Enter Map', ru: 'Создать профиль и войти на карту', ka: 'პროფილის შექმნა და რუკაზე შესვლა', es: 'Crear perfil y entrar al mapa', uk: 'Створити профіль і перейти до карти', pl: 'Utwórz profil i wejdź na mapę', hi: 'प्रोफ़ाइल बनाएं और मैप में जाएं', am: 'መገለጫ ፍጠር እና ካርታ ክፈት' },

  // Map
  'map.nearby': { en: 'nearby', ru: 'рядом', ka: 'ახლოს', es: 'cerca', uk: 'поруч', pl: 'w pobliżu', hi: 'पास', am: 'በአቅራቢያ' },
  'map.loadingMap': { en: 'Loading map...', ru: 'Загрузка карты...', ka: 'რუკის ჩატვირთვა...', es: 'Cargando mapa...', uk: 'Завантаження карти...', pl: 'Ładowanie mapy...', hi: 'मैप लोड हो रहा है...', am: 'ካርታ በመጫን ላይ...' },

  // Driving mode
  'driving.banner': { en: '🚛 Driving Mode — Stay safe, pull over to type', ru: '🚛 Режим вождения — будьте осторожны', ka: '🚛 მართვის რეჟიმი — იყავით ფრთხილად', es: '🚛 Modo conducción — Detente para escribir', uk: '🚛 Режим водіння — будьте обережні', pl: '🚛 Tryb jazdy — zatrzymaj się, by pisać', hi: '🚛 ड्राइविंग मोड — सुरक्षित रहें, टाइप करने के लिए रुकें', am: '🚛 የመንዳት ሁነታ — ጥንቃቄ ያድርጉ' },
  'driving.parked': { en: "I'm Parked", ru: 'Я припарковался', ka: 'გავჩერდი', es: 'Estoy estacionado', uk: 'Я припаркувався', pl: 'Zaparkowany', hi: 'मैं पार्क हूं', am: 'አቁሜያለሁ' },

  // Preset messages
  'preset.traffic': { en: '🛑 Traffic ahead', ru: '🛑 Пробка впереди', ka: '🛑 საცობი წინ', es: '🛑 Tráfico adelante', uk: '🛑 Затор попереду', pl: '🛑 Korek przed nami', hi: '🛑 आगे ट्रैफ़िक', am: '🛑 ትራፊክ ወደፊት' },
  'preset.cop': { en: '🚔 Cop spotted', ru: '🚔 Полиция впереди', ka: '🚔 პოლიცია', es: '🚔 Policía vista', uk: '🚔 Поліція', pl: '🚔 Policja', hi: '🚔 पुलिस दिखी', am: '🚔 ፖሊስ ታይቷል' },
  'preset.roadClosed': { en: '🚧 Road closed', ru: '🚧 Дорога закрыта', ka: '🚧 გზა დაკეტილია', es: '🚧 Carretera cerrada', uk: '🚧 Дорога закрита', pl: '🚧 Droga zamknięta', hi: '🚧 सड़क बंद', am: '🚧 መንገድ ተዘግቷል' },
  'preset.fuel': { en: '⛽ Need fuel', ru: '⛽ Нужно топливо', ka: '⛽ საწვავი მჭირდება', es: '⛽ Necesito gasolina', uk: '⛽ Потрібне паливо', pl: '⛽ Potrzebuję paliwa', hi: '⛽ ईंधन चाहिए', am: '⛽ ነዳጅ ያስፈልጋል' },
  'preset.parking': { en: '🅿️ Good parking', ru: '🅿️ Хорошая парковка', ka: '🅿️ კარგი პარკინგი', es: '🅿️ Buen estacionamiento', uk: '🅿️ Гарна парковка', pl: '🅿️ Dobry parking', hi: '🅿️ अच्छी पार्किंग', am: '🅿️ ጥሩ ማቆሚያ' },
  'preset.ice': { en: '🧊 Ice on road', ru: '🧊 Гололёд', ka: '🧊 ყინული გზაზე', es: '🧊 Hielo en carretera', uk: '🧊 Ожеледиця', pl: '🧊 Lód na drodze', hi: '🧊 सड़क पर बर्फ', am: '🧊 በመንገድ ላይ በረዶ' },
  'preset.accident': { en: '🚗💥 Accident ahead', ru: '🚗💥 Авария впереди', ka: '🚗💥 ავარია წინ', es: '🚗💥 Accidente adelante', uk: '🚗💥 Аварія попереду', pl: '🚗💥 Wypadek przed nami', hi: '🚗💥 आगे दुर्घटना', am: '🚗💥 አደጋ ወደፊት' },
  'preset.restStop': { en: '😴 Rest stop good', ru: '😴 Хорошая стоянка', ka: '😴 კარგი გაჩერება', es: '😴 Parada de descanso buena', uk: '😴 Гарна стоянка', pl: '😴 Dobra stacja odpoczynku', hi: '😴 अच्छा रेस्ट स्टॉप', am: '😴 ጥሩ ማረፊያ' },

  // Voice
  'voice.title': { en: 'Voice Room', ru: 'Голосовая комната', ka: 'ხმოვანი ოთახი', es: 'Sala de voz', uk: 'Голосова кімната', pl: 'Pokój głosowy', hi: 'वॉयस रूम', am: 'የድምፅ ክፍል' },
  'voice.join': { en: 'Join Voice Room', ru: 'Присоединиться', ka: 'შეუერთდით', es: 'Unirse', uk: 'Приєднатися', pl: 'Dołącz', hi: 'वॉयस रूम में जुड़ें', am: 'ተቀላቀል' },
  'voice.mute': { en: 'Mute', ru: 'Без звука', ka: 'დადუმება', es: 'Silenciar', uk: 'Вимкнути', pl: 'Wycisz', hi: 'म्यूट', am: 'ዝጋ' },
  'voice.unmute': { en: 'Unmute', ru: 'Включить', ka: 'ხმის ჩართვა', es: 'Activar', uk: 'Увімкнути', pl: 'Odcisz', hi: 'अनम्यूट', am: 'ክፈት' },
  'voice.leave': { en: 'Leave', ru: 'Выйти', ka: 'გასვლა', es: 'Salir', uk: 'Вийти', pl: 'Opuść', hi: 'छोड़ें', am: 'ውጣ' },
  'voice.participants': { en: 'Participants', ru: 'Участники', ka: 'მონაწილეები', es: 'Participantes', uk: 'Учасники', pl: 'Uczestnicy', hi: 'प्रतिभागी', am: 'ተሳታፊዎች' },
  'voice.connecting': { en: 'Connecting…', ru: 'Подключение…', ka: 'დაკავშირება…', es: 'Conectando…', uk: 'Підключення…', pl: 'Łączenie…', hi: 'कनेक्ट हो रहा है…', am: 'በመገናኘት ላይ…' },
  'voice.notConnected': { en: 'Not connected', ru: 'Не подключено', ka: 'არ არის დაკავშირებული', es: 'No conectado', uk: 'Не підключено', pl: 'Nie połączono', hi: 'कनेक्ट नहीं है', am: 'አልተገናኘም' },

  // General
  'general.loading': { en: 'Loading...', ru: 'Загрузка...', ka: 'ჩატვირთვა...', es: 'Cargando...', uk: 'Завантаження...', pl: 'Ładowanie...', hi: 'लोड हो रहा है...', am: 'በመጫን ላይ...' },
  'general.error': { en: 'Something went wrong', ru: 'Что-то пошло не так', ka: 'რაღაც არასწორია', es: 'Algo salió mal', uk: 'Щось пішло не так', pl: 'Coś poszło nie tak', hi: 'कुछ गलत हो गया', am: 'የሆነ ስህተት ተከስቷል' },
  'general.signOutConfirm': { en: 'Sign out of RouteLink?', ru: 'Выйти из RouteLink?', ka: 'გამოხვიდეთ RouteLink-იდან?', es: '¿Cerrar sesión de RouteLink?', uk: 'Вийти з RouteLink?', pl: 'Wylogować z RouteLink?', hi: 'RouteLink से साइन आउट करें?', am: 'ከRouteLink ውጣ?' },
};

export function getTranslation(key: string, lang: SupportedLanguage = 'en'): string {
  const entry = translations[key];
  if (!entry) return key;
  return entry[lang] || entry.en || key;
}
