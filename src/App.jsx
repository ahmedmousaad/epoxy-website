import React, { useState, useEffect, useRef } from 'react';
import { Phone, Upload, Lock, Sparkles, Layers, ShieldCheck, Send, User, MessageSquare, Trash2, ArrowLeft, ChevronLeft, Bot, X, RefreshCw } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { supabase } from './supabase';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

function App() {
  const [projects, setProjects] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  const [showAdmin, setShowAdmin] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);

  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactService, setContactService] = useState('إيبوكسي سيلف ليفلنج');
  const [contactMessage, setContactMessage] = useState('');
  const [submittingContact, setSubmittingContact] = useState(false);

  // --- حالات الشات بوت الذكي ---
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatStep, setChatStep] = useState(0);
  const [chatData, setChatData] = useState({ spaceType: '', area: 0, condition: '' });
  const [areaInput, setAreaInput] = useState(''); 
  const [customConditionInput, setCustomConditionInput] = useState('');
  const [customSpaceInput, setCustomSpaceInput] = useState(''); // حالة جديدة لإدخال نوع المكان يدوياً
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  
  const [messages, setMessages] = useState([
    { text: 'أهلاً بيك! أنا المساعد الذكي لإيبوكسي مصر 🤖', sender: 'bot' },
    { text: 'عشان أعملك مقايسة سريعة، المكان اللي هتجهزه عبارة عن إيه؟ (اختار أو اكتب بنفسك)', sender: 'bot' }
  ]);

  const spaceOptions = ['مصنع / مخزن', 'جراج سيارات', 'محل تجاري / مطعم'];
  const conditionOptions = ['خرسانة ناعمة (ممسوسة هليكوبتر)', 'خرسانة خشنة', 'سيراميك / بلاط'];

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleChatAnswer = (answer, type) => {
    setMessages(prev => [...prev, { text: answer.toString() + (type === 'area' ? ' متر مربع' : ''), sender: 'user' }]);
    setIsTyping(true);

    setTimeout(() => {
      let newChatData = { ...chatData, [type]: answer };
      setChatData(newChatData);
      setIsTyping(false);

      if (chatStep === 0) {
        setMessages(prev => [...prev, { text: 'ممتاز! المساحة الإجمالية للمكان تقريباً كام متر مربع؟ (اكتب الرقم)', sender: 'bot' }]);
        setChatStep(1);
      } 
      else if (chatStep === 1) {
        setMessages(prev => [...prev, { text: 'حالة الأرضية الحالية إيه؟ (مهمة جداً لحساب التجهيز والتأسيس)', sender: 'bot' }]);
        setChatStep(2);
      } 
      else if (chatStep === 2) {
        generateQuote(newChatData);
      }
    }, 800);
  };

  const generateQuote = (data) => {
    let prepCost = 100; 
    if (data.condition === 'سيراميك / بلاط') prepCost = 150;
    else if (data.condition === 'خرسانة خشنة') prepCost = 100;
    else if (data.condition === 'خرسانة ناعمة (ممسوسة هليكوبتر)') prepCost = 50;
    
    let areaNum = Number(data.area);
    let thinCoatingPrice = (250 + prepCost) * areaNum;
    let antiSlipPrice = (350 + prepCost) * areaNum;
    let selfLevelingPrice = (550 + prepCost) * areaNum;

    let recommendation = '';
    let reason = '';
    let warning = '';

    let space = data.spaceType;

    // تحليل الكلمات المفتاحية بذكاء
    if (space.includes('جراج') || space.includes('مطلع') || space.includes('منزل') || space.includes('منحدر') || space.includes('مدرسه') || space.includes('مدرسة')) {
      recommendation = 'الإيبوكسي الخشن (Anti-Slip)';
      reason = 'لأنه مصمم خصيصاً لمنع الانزلاق، وبيتحمل الاحتكاك المستمر وحركة الكاوتش أو المشي الكثيف بأمان تام.';
    } else if (space.includes('مصنع') || space.includes('مخزن')) {
      recommendation = 'إيبوكسي سيلف ليفلنج (Self-Leveling)';
      reason = 'لأنه بيتحمل الأحمال التقيلة للمعدات، وسطحه ناعم بيسهل حركة الكلارك والتنظيف.';
    } else {
      recommendation = 'إيبوكسي حماية خفيف أو سيلف ليفلنج';
      reason = 'بيدي شكل جمالي وعملي جداً، وبيحمي الأرضية من التآكل والرطوبة وبتكلفة اقتصادية.';
    }

    // التحذير الهندسي الصارم للدهانات الخفيفة
    if (recommendation.includes('حماية خفيف') && !data.condition.includes('ممسوسة')) {
      warning = `\n\n⚠️ ملاحظة هندسية هامة: إيبوكسي الحماية الخفيف بيحتاج أرضية "خرسانة ممسوسة هليكوبتر" لأن سمكه رفيع ومش بيداري عيوب الأرضية. بما إن أرضيتك الحالية (${data.condition})، فالأصح هندسياً نعمل (سيلف ليفلنج - صب) عشان نسوي السطح بالكامل ويديك نتيجة مثالية بدون تمويجات.`;
    }

    setMessages(prev => [
      ...prev, 
      { 
        text: `بناءً على طلبك (${data.spaceType} بمساحة ${areaNum}متر وأرضية ${data.condition}): \n\n🎯 ترشيح الـ AI الأفضل لك:\n${recommendation}\n💡 السبب: ${reason}${warning}\n\n💰 متوسط التكلفة التقديرية (شامل التجهيز للخامات والمصنعية):\n- إيبوكسي دهانات خفيفة: ~ ${thinCoatingPrice.toLocaleString()} ج\n- إيبوكسي خشن (مانع انزلاق): ~ ${antiSlipPrice.toLocaleString()} ج\n- إيبوكسي سيلف ليفلنج (صب): ~ ${selfLevelingPrice.toLocaleString()} ج`, 
        sender: 'bot' 
      },
      { text: 'الأسعار دي قابلة للتفاوض حسب المعاينة الفعيلة.. تحب المهندس يكلمك يحدد معاينة مجانية؟ (سيب بياناتك في الموقع)', sender: 'bot' }
    ]);
    setChatStep(3);
  };

  const restartChat = () => {
    setChatStep(0);
    setChatData({ spaceType: '', area: 0, condition: '' });
    setAreaInput('');
    setCustomConditionInput('');
    setCustomSpaceInput('');
    setMessages([
      { text: 'أهلاً بيك من جديد! المكان اللي هتجهزه عبارة عن إيه؟', sender: 'bot' }
    ]);
  };
  // ------------------------------

  const fetchData = async () => {
    setLoading(true);
    const { data: projectsData } = await supabase.from('projects').select('*').order('id', { ascending: false });
    if (projectsData) setProjects(projectsData);
    const { data: leadsData } = await supabase.from('leads').select('*').order('id', { ascending: false });
    if (leadsData) setLeads(leadsData);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdminAccess = () => {
    if (!showAdmin) {
      const password = prompt("أدخل كلمة مرور الإدارة:");
      if (password === "admin123") setShowAdmin(true);
      else alert("كلمة المرور غير صحيحة!");
    } else {
      setShowAdmin(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!files.length || !title) return alert('يرجى ملء البيانات واختيار صورة واحدة على الأقل');
    setUploading(true);
    const uploadedUrls = [];
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('epoxy-images').upload(fileName, file);
      if (!uploadError) {
        const { data } = supabase.storage.from('epoxy-images').getPublicUrl(fileName);
        uploadedUrls.push(data.publicUrl);
      }
    }
    const { error: insertError } = await supabase.from('projects').insert([{ title, description, images: uploadedUrls }]);
    setUploading(false);
    if (insertError) alert('حدث خطأ أثناء الحفظ');
    else { setTitle(''); setDescription(''); setFiles([]); alert('تم رفع المشروع بنجاح!'); fetchData(); }
  };

  const handleDeleteProject = async (id, images) => {
    const confirmDelete = window.confirm("هل أنت متأكد من حذف هذا المشروع نهائياً؟");
    if (!confirmDelete) return;
    if (images && images.length > 0) {
      const fileNames = images.map(url => url.split('/').pop());
      await supabase.storage.from('epoxy-images').remove(fileNames);
    }
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) alert("حدث خطأ أثناء الحذف!"); else { alert("تم حذف المشروع والصور بنجاح!"); fetchData(); }
  };

  const handleSubmitContact = async (e) => {
    e.preventDefault();
    if (!contactName || !contactPhone) return alert('برجاء إدخال الاسم ورقم الهاتف');
    setSubmittingContact(true);
    const { error } = await supabase.from('leads').insert([{ name: contactName, phone: contactPhone, service: contactService, message: contactMessage }]);
    setSubmittingContact(false);
    if (error) alert('حدث خطأ، يرجى المحاولة مرة أخرى.');
    else {
      alert('تم إرسال طلبك بنجاح! سنتواصل معك قريباً.');
      setContactName(''); setContactPhone(''); setContactMessage(''); setContactService('إيبوكسي سيلف ليفلنج');
      fetchData();
    }
  };

  const openWhatsApp = () => {
    window.open(`https://wa.me/201000000000?text=${encodeURIComponent("مرحباً، أريد الاستفسار عن خدمات الإيبوكسي")}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-right font-sans selection:bg-cyan-500 selection:text-white relative overflow-hidden" dir="rtl">
      <style>
        {`
          @keyframes gradient-x { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
          @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
          @keyframes float-up { 0% { opacity: 0; transform: translateY(30px); } 100% { opacity: 1; transform: translateY(0); } }
          @keyframes bounce-subtle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
          .animate-gradient-x { background-size: 200% 200%; animation: gradient-x 4s ease infinite; }
          .animate-blob { animation: blob 7s infinite; }
          .animation-delay-2000 { animation-delay: 2s; }
          .animation-delay-4000 { animation-delay: 4s; }
          .glass-card { background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.05); }
          .animate-float-up { animation: float-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
          .animate-bounce-subtle { animation: bounce-subtle 2s infinite; }
          .swiper-button-next, .swiper-button-prev { color: #06b6d4 !important; transform: scale(0.6); }
          @media (min-width: 768px) { .swiper-button-next, .swiper-button-prev { transform: scale(0.8); } }
        `}
      </style>

      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-72 h-72 md:w-96 md:h-96 bg-cyan-500/20 rounded-full mix-blend-screen filter blur-[80px] animate-blob"></div>
        <div className="absolute top-[20%] left-[-10%] w-72 h-72 md:w-96 md:h-96 bg-blue-600/20 rounded-full mix-blend-screen filter blur-[80px] animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-72 h-72 md:w-96 md:h-96 bg-purple-600/20 rounded-full mix-blend-screen filter blur-[80px] animate-blob animation-delay-4000"></div>
      </div>

      <nav className="glass-card sticky top-0 z-40 transition-all duration-300">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-4 py-3 md:py-4">
          <div className="flex items-center gap-2 cursor-pointer">
            <h1 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 animate-gradient-x logo-font px-2 py-1 tracking-normal">
              أرضيات ايبوكسي مصر
            </h1>
          </div>
          <button onClick={openWhatsApp} className="flex items-center gap-1.5 md:gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-3 md:px-5 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] active:scale-95 transition-all">
            <Phone size={16} /> <span className="whitespace-nowrap">تواصل معنا</span>
          </button>
        </div>
      </nav>

      <div className="fixed bottom-6 left-4 z-50 flex flex-col items-start">
        {isChatOpen && (
          <div className="mb-4 w-[calc(100vw-2rem)] md:w-80 bg-slate-900/95 backdrop-blur-2xl border border-cyan-500/30 rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.3)] overflow-hidden flex flex-col animate-float-up" style={{ transformOrigin: 'bottom left' }}>
            
            <div className="bg-slate-800/80 p-3 flex justify-between items-center border-b border-cyan-500/20">
              <div className="flex items-center gap-2">
                <div className="bg-cyan-500 p-1.5 rounded-full text-white"><Bot size={18} /></div>
                <div>
                  <h3 className="text-white text-sm font-bold">المساعد الهندسي (AI)</h3>
                  <p className="text-cyan-400 text-[10px]">جاهز لحساب مقايستك</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={restartChat} className="text-slate-400 hover:text-white transition-colors" title="إعادة التسعير"><RefreshCw size={16} /></button>
                <button onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-red-400 transition-colors"><X size={20} /></button>
              </div>
            </div>

            <div className="p-4 h-64 overflow-y-auto space-y-3 custom-scrollbar text-sm">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-2xl max-w-[90%] whitespace-pre-line leading-relaxed shadow-sm ${msg.sender === 'user' ? 'bg-cyan-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 text-slate-400 p-3 rounded-2xl rounded-bl-none border border-slate-700 flex gap-1">
                    <span className="animate-bounce">•</span><span className="animate-bounce delay-100">•</span><span className="animate-bounce delay-200">•</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex flex-wrap gap-2">
              
              {chatStep === 0 && (
                <div className="w-full flex flex-col gap-2">
                  <div className="flex flex-wrap gap-2">
                    {spaceOptions.map(opt => (
                      <button key={opt} onClick={() => handleChatAnswer(opt, 'spaceType')} className="bg-cyan-500/10 hover:bg-cyan-500 hover:text-slate-900 border border-cyan-500/50 text-cyan-400 text-xs px-3 py-1.5 rounded-full transition-all">
                        {opt}
                      </button>
                    ))}
                  </div>
                  <form 
                    onSubmit={(e) => { e.preventDefault(); if(customSpaceInput.trim()) handleChatAnswer(customSpaceInput, 'spaceType'); }} 
                    className="flex w-full gap-2 items-center mt-1"
                  >
                    <input type="text" value={customSpaceInput} onChange={(e) => setCustomSpaceInput(e.target.value)} placeholder="مدرسة، مطلع، إلخ.." className="flex-1 bg-slate-900 border border-cyan-500/50 text-white rounded-xl px-3 py-2 text-sm outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400" required />
                    <button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-4 py-2 rounded-xl font-bold text-sm transition-colors shadow-md">إرسال</button>
                  </form>
                </div>
              )}

              {chatStep === 1 && (
                <form 
                  onSubmit={(e) => { e.preventDefault(); if(areaInput > 0) handleChatAnswer(areaInput, 'area'); }} 
                  className="flex w-full gap-2 items-center"
                >
                  <input type="number" value={areaInput} onChange={(e) => setAreaInput(e.target.value)} placeholder="اكتب المساحة هنا (متر).." className="flex-1 bg-slate-900 border border-cyan-500/50 text-white rounded-xl px-3 py-2 text-sm outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400" required min="1" />
                  <button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-4 py-2 rounded-xl font-bold text-sm transition-colors shadow-md">تأكيد</button>
                </form>
              )}

              {chatStep === 2 && (
                <div className="w-full flex flex-col gap-2">
                  <div className="flex flex-wrap gap-2">
                    {conditionOptions.map(opt => (
                      <button key={opt} onClick={() => handleChatAnswer(opt, 'condition')} className="bg-cyan-500/10 hover:bg-cyan-500 hover:text-slate-900 border border-cyan-500/50 text-cyan-400 text-xs px-3 py-1.5 rounded-full transition-all">
                        {opt}
                      </button>
                    ))}
                  </div>
                  <form 
                    onSubmit={(e) => { e.preventDefault(); if(customConditionInput.trim()) handleChatAnswer(customConditionInput, 'condition'); }} 
                    className="flex w-full gap-2 items-center mt-1"
                  >
                    <input type="text" value={customConditionInput} onChange={(e) => setCustomConditionInput(e.target.value)} placeholder="أو اكتب حالة الأرضية يدوياً.." className="flex-1 bg-slate-900 border border-cyan-500/50 text-white rounded-xl px-3 py-2 text-sm outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400" required />
                    <button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-4 py-2 rounded-xl font-bold text-sm transition-colors shadow-md">إرسال</button>
                  </form>
                </div>
              )}

              {chatStep === 3 && (
                <a href="#contact" onClick={() => setIsChatOpen(false)} className="w-full text-center bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm py-2.5 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:scale-[1.02] transition-transform">
                  حجز معاينة مجانية
                </a>
              )}
            </div>
          </div>
        )}

        <div className="relative">
          {!isChatOpen && (
            <div className="absolute -top-12 -right-6 md:-right-10 bg-cyan-600 text-white text-xs font-bold px-4 py-2 rounded-t-xl rounded-bl-xl rounded-br-sm shadow-[0_0_15px_rgba(6,182,212,0.5)] animate-bounce-subtle whitespace-nowrap after:content-[''] after:absolute after:-bottom-2 after:right-4 after:border-t-8 after:border-t-cyan-600 after:border-l-8 after:border-l-transparent after:border-r-8 after:border-r-transparent">
              الـ AI بيحسبلك التكلفة! 🤖
            </div>
          )}

          <button onClick={() => setIsChatOpen(!isChatOpen)} className="bg-slate-900 border border-cyan-500 text-cyan-400 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-110 active:scale-95 transition-transform relative z-10">
            {isChatOpen ? <X size={26} /> : <Bot size={28} />}
            {!isChatOpen && <span className="absolute -top-1 -right-1 flex h-4 w-4"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span><span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500 border-2 border-slate-900"></span></span>}
          </button>
        </div>
      </div>

      <button onClick={openWhatsApp} className="md:hidden fixed bottom-6 right-4 z-40 bg-gradient-to-r from-green-400 to-emerald-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:scale-110 active:scale-90 transition-transform">
        <MessageSquare size={24} />
      </button>

      <section className="relative pt-20 pb-24 md:pt-32 md:pb-32 px-4 text-center z-10">
        <div className="max-w-4xl mx-auto animate-float-up" style={{ animationDelay: '0.1s' }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-bold mb-8 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
            ضمان الجودة والفخامة
          </div>
          
          <h1 className="text-4xl md:text-7xl font-black text-white mb-6 md:mb-8 leading-tight">
            المستقبل في <br className="md:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 animate-gradient-x"> تصميم الأرضيات</span>
          </h1>
          
          <p className="text-base md:text-xl text-slate-400 mb-10 md:mb-12 leading-relaxed max-w-2xl mx-auto font-light px-2">
            اكتشف أحدث صيحات الإيبوكسي في مصر. نحول المساحات الصناعية والتجارية إلى أرضيات شديدة التحمل تعيش لسنوات.
          </p>
          
          <a href="#contact" className="group relative inline-flex items-center justify-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-full text-base md:text-lg font-bold shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:-translate-y-1 transition-all overflow-hidden">
            <span className="relative">احجز معاينتك مجاناً</span>
            <ChevronLeft size={20} className="relative group-hover:-translate-x-1 transition-transform" />
          </a>
        </div>
      </section>

      <section className="py-16 md:py-24 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 md:mb-16 animate-float-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">خدماتنا الهندسية</h2>
            <p className="text-slate-400 text-sm md:text-lg max-w-2xl mx-auto">حلول متكاملة تناسب المصانع، الشركات، والمساحات التجارية.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="glass-card p-6 md:p-8 rounded-[2rem] hover:bg-slate-800/50 hover:border-cyan-500/50 transition-all duration-300 group animate-float-up" style={{ animationDelay: '0.3s' }}>
              <div className="w-14 h-14 md:w-16 md:h-16 bg-cyan-500/10 text-cyan-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-white transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <Sparkles size={28} />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-white mb-3">دهانات (Self-Leveling)</h3>
              <p className="text-slate-400 text-sm md:text-base leading-relaxed">أرضيات إيبوكسي ذاتية التسوية بسماكات مختلفة، لامعة وناعمة بالكامل بقوة تحمل خرافية للأحمال الميكانيكية.</p>
            </div>
            
            <div className="glass-card p-6 md:p-8 rounded-[2rem] hover:bg-slate-800/50 hover:border-blue-500/50 transition-all duration-300 group animate-float-up" style={{ animationDelay: '0.4s' }}>
              <div className="w-14 h-14 md:w-16 md:h-16 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                <Layers size={28} />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-white mb-3">إيبوكسي حماية خفيف</h3>
              <p className="text-slate-400 text-sm md:text-base leading-relaxed">طبقة واقية رفيعة لحماية الأسطح الإنشائية من التآكل والرطوبة مع الحفاظ على مظهرها العصري الطبيعي.</p>
            </div>
            
            <div className="glass-card p-6 md:p-8 rounded-[2rem] hover:bg-slate-800/50 hover:border-purple-500/50 transition-all duration-300 group animate-float-up" style={{ animationDelay: '0.5s' }}>
              <div className="w-14 h-14 md:w-16 md:h-16 bg-purple-500/10 text-purple-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-white transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-white mb-3">الدهانات الخشنة (Anti-Slip)</h3>
              <p className="text-slate-400 text-sm md:text-base leading-relaxed">ملمس خشن مصمم خصيصاً لتوفير أقصى درجات الأمان في المصانع، الجراجات، والمناطق المعرضة للمياه.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black text-center mb-10 md:mb-16 text-white animate-float-up" style={{ animationDelay: '0.2s' }}>معرض الأعمال</h2>
          
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
            </div>
          ) : projects.length === 0 ? (
            <p className="text-center text-slate-500 py-10">لا توجد مشاريع مضافة حتى الآن.</p>
          ) : (
            <div className="space-y-8 md:space-y-12">
              {projects.map((project, index) => (
                <div key={project.id} className="glass-card rounded-[2rem] overflow-hidden p-4 md:p-8 relative hover:border-cyan-500/30 transition-colors animate-float-up" style={{ animationDelay: `${0.2 + (index * 0.1)}s` }}>
                  
                  {showAdmin && (
                    <button onClick={() => handleDeleteProject(project.id, project.images)} className="absolute top-6 left-6 z-10 bg-red-500/80 text-white p-2.5 rounded-xl flex items-center gap-2 backdrop-blur-md hover:bg-red-500 transition-colors">
                      <Trash2 size={16} /> <span className="text-sm font-bold hidden md:inline">حذف</span>
                    </button>
                  )}

                  <div className="mb-4 md:mb-6 px-2">
                    <h3 className="text-xl md:text-3xl font-bold text-white mb-2">{project.title}</h3>
                    <p className="text-slate-400 text-sm md:text-base leading-relaxed">{project.description}</p>
                  </div>
                  
                  <div className="rounded-xl md:rounded-2xl overflow-hidden h-[250px] md:h-[500px] bg-[#050B14] border border-white/5 relative group">
                    {project.images && project.images.length > 0 ? (
                      <Swiper modules={[Navigation, Pagination]} navigation pagination={{ clickable: true, dynamicBullets: true }} className="w-full h-full">
                        {project.images.map((img, i) => (
                          <SwiperSlide key={i}>
                            <img src={img} alt={`صورة ${i + 1}`} className="w-full h-full object-cover md:object-contain transition-transform duration-[3s] hover:scale-105" />
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600 text-sm">لا توجد صور</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="contact" className="py-16 md:py-24 px-4 relative z-10">
        <div className="max-w-3xl mx-auto relative animate-float-up" style={{ animationDelay: '0.3s' }}>
          <div className="glass-card p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] relative overflow-hidden shadow-2xl shadow-cyan-900/20 border-t border-t-cyan-500/30">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50 blur-sm"></div>

            <div className="text-center mb-8 md:mb-10">
              <h2 className="text-2xl md:text-4xl font-black text-white mb-3">لنبدأ مشروعك الآن</h2>
              <p className="text-slate-400 text-sm md:text-base">تواصل مع خبرائنا وسنرد عليك فوراً لترتيب المعاينة.</p>
            </div>
            
            <form onSubmit={handleSubmitContact} className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-xs md:text-sm font-semibold mb-2 text-slate-300">الاسم بالكامل</label>
                  <input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} className="w-full bg-[#050B14] border border-slate-700 text-white rounded-xl md:rounded-2xl p-3 md:p-4 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all text-sm md:text-base" required />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-semibold mb-2 text-slate-300">رقم الهاتف (واتساب)</label>
                  <input type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="w-full bg-[#050B14] border border-slate-700 text-white rounded-xl md:rounded-2xl p-3 md:p-4 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all text-sm md:text-base" required />
                </div>
              </div>
              <div>
                <label className="block text-xs md:text-sm font-semibold mb-2 text-slate-300">نوع الخدمة</label>
                <select value={contactService} onChange={(e) => setContactService(e.target.value)} className="w-full bg-[#050B14] border border-slate-700 text-white rounded-xl md:rounded-2xl p-3 md:p-4 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all appearance-none text-sm md:text-base">
                  <option value="إيبوكسي سيلف ليفلنج">إيبوكسي سيلف ليفلنج</option>
                  <option value="إيبوكسي حماية خفيف">إيبوكسي حماية خفيف</option>
                  <option value="إيبوكسي خشن (Anti-Slip)">إيبوكسي خشن (Anti-Slip)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs md:text-sm font-semibold mb-2 text-slate-300">رسالتك (اختياري)</label>
                <textarea value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} className="w-full bg-[#050B14] border border-slate-700 text-white rounded-xl md:rounded-2xl p-3 md:p-4 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all text-sm md:text-base" rows="3" />
              </div>
              <button type="submit" disabled={submittingContact} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-base md:text-lg py-4 md:py-5 rounded-xl md:rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] mt-4">
                {submittingContact ? 'جاري الإرسال...' : <><Send size={20} /> تأكيد الطلب</>}
              </button>
            </form>
          </div>
        </div>
      </section>

      {showAdmin && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B1120] border border-cyan-500/30 p-6 md:p-8 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-[0_0_50px_rgba(6,182,212,0.2)]">
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
              <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2"><Lock className="text-cyan-400" /> الإدارة</h2>
              <button onClick={() => setShowAdmin(false)} className="bg-white/10 hover:bg-red-500 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors">✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <form onSubmit={handleCreateProject} className="space-y-4 bg-white/5 p-5 rounded-2xl border border-white/5">
                <h3 className="font-bold text-white mb-2">إضافة مشروع</h3>
                <input type="text" placeholder="اسم المشروع" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-black/50 border border-white/10 text-white rounded-xl p-3 outline-none focus:border-cyan-500 text-sm" required />
                <textarea placeholder="الوصف" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-black/50 border border-white/10 text-white rounded-xl p-3 outline-none focus:border-cyan-500 text-sm" rows="2" />
                <input type="file" multiple accept="image/*" onChange={(e) => setFiles(Array.from(e.target.files))} className="w-full text-slate-400 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-cyan-500/20 file:text-cyan-400" required />
                <button type="submit" disabled={uploading} className="w-full bg-cyan-500 text-black py-3 rounded-xl font-bold text-sm">
                  {uploading ? 'جاري الرفع...' : 'نشر'}
                </button>
              </form>

              <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                <h3 className="font-bold text-white mb-4 flex justify-between">الطلبات <span className="text-cyan-400">{leads.length}</span></h3>
                <div className="h-[250px] overflow-y-auto space-y-3 pr-1">
                  {leads.map(lead => (
                    <div key={lead.id} className="bg-black/50 p-3 rounded-xl border border-white/5 text-sm">
                      <div className="flex justify-between text-white mb-1"><b>{lead.name}</b> <span className="text-xs text-slate-500">{new Date(lead.created_at).toLocaleDateString('ar-EG')}</span></div>
                      <div className="text-cyan-400 mb-1">{lead.phone}</div>
                      <div className="text-slate-400 text-xs">{lead.service}</div>
                      {lead.message && <div className="mt-2 text-slate-500 text-xs border-t border-white/5 pt-1">{lead.message}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="relative z-10 border-t border-white/10 pt-10 pb-20 md:pb-6 px-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center text-slate-500">
          <button onClick={handleAdminAccess} className="hover:text-cyan-400 transition-colors p-2"><Lock size={16} /></button>
          <p className="text-xs md:text-sm">© 2026 أرضيات إيبوكسي مصر.</p>
          <div className="w-6"></div>
        </div>
      </footer>

    </div>
  );
}

export default App;