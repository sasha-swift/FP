// ==================== ПУЛ ЗВУКОВ ====================
class SoundManager {
  constructor() {
    this.soundPools = {};
    this.POOL_SIZE = 4;
    this.preload();
  }

  // Предзагрузка всех звуковых файлов в память браузера
  preload() {
    const soundFiles = {
      click: 'assets/sounds/click.mp3', done: 'assets/sounds/done.mp3',
      damage: 'assets/sounds/damage.mp3', explosion: 'assets/sounds/explosion.ogg',
      pig: 'assets/sounds/pig.ogg', cow: 'assets/sounds/cow.ogg', cat: 'assets/sounds/cat.ogg',
      wolf: 'assets/sounds/wolf.ogg', sheep: 'assets/sounds/sheep.ogg', skeleton: 'assets/sounds/skeleton.ogg',
      enderman: 'assets/sounds/enderman.ogg', zombie: 'assets/sounds/zombie.ogg', challenge: 'assets/sounds/challenge.ogg'
    };

    Object.entries(soundFiles).forEach(([name, src]) => {
      this.soundPools[name] = [];
      for (let i = 0; i < this.POOL_SIZE; i++) {
        const audio = new Audio(src);
        audio.preload = 'auto'; 
        audio.volume = 0.5; 
        audio.load();
        this.soundPools[name].push(audio);
      }
    });
  }

  // Воспроизведение звука: ищет свободный экземпляр в пуле или создает временный
  play(name) {
    if (!this.soundPools[name] || this.soundPools[name].length === 0) return;
    const freeAudio = this.soundPools[name].find(audio => audio.paused);
    
    if (freeAudio) {
      freeAudio.currentTime = 0; // Перемотка в начало
      freeAudio.play().catch((err) => console.warn(`Sound ${name} failed:`, err));
    } else {
      // Fallback: если все экземпляры заняты, создаем временный и удаляем его после воспроизведения
      const tempAudio = new Audio(this.soundPools[name][0].src);
      tempAudio.volume = 0.5;
      tempAudio.play().catch((err) => console.warn(`Sound ${name} failed:`, err));
      tempAudio.addEventListener('ended', () => tempAudio.remove());
    }
  }
}
const soundManager = new SoundManager();

// ==================== МУЗЫКА ПРОИГРЫВАТЕЛЯ ====================
const jukeboxMusic = new Audio('assets/sounds/otherside.mp3');
jukeboxMusic.loop = true; 
jukeboxMusic.volume = 0.5; 
jukeboxMusic.preload = 'auto'; 
jukeboxMusic.load();
let isMusicPlaying = false;

// ==================== УПРАВЛЕНИЕ СОСТОЯНИЕМ ====================
const initialState = { tasks: [], filter: 'all' };
let state = initialState;

const setState = (newState) => {
  state = { ...state, ...newState }; 
  render(); 
};

// ==================== ЧИСТЫЕ ФУНКЦИИ ====================
// Добавление задачи 
const addTask = (tasks, text, date, isImportant) => [
  ...tasks, { id: crypto.randomUUID(), text, date, isImportant, completed: false, createdAt: Date.now() }
];

// Переключение статуса задачи 
const toggleTask = (tasks, id) => tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task);

// Удаление задачи
const deleteTask = (tasks, id) => tasks.filter(task => task.id !== id);

// Фильтрация задач 
const getFilteredTasks = (tasks, filterType) => {
  switch (filterType) {
    case 'active': return tasks.filter(task => !task.completed);
    case 'completed': return tasks.filter(task => task.completed);
    case 'important': return tasks.filter(task => task.isImportant);
    default: return tasks;
  }
};

// Сортировка задач по приоритету
const sortTasks = (tasks) => {
  return [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (a.isImportant !== b.isImportant) return a.isImportant ? -1 : 1;
    const aHasDate = !!a.date, bHasDate = !!b.date;
    if (aHasDate && !bHasDate) return -1;
    if (!aHasDate && bHasDate) return 1;
    if (aHasDate && bHasDate) return new Date(a.date).getTime() - new Date(b.date).getTime();
    return a.createdAt - b.createdAt;
  });
};

// Проверка: просрочена ли задача
const isOverdue = (task) => {
  if (!task.date || task.completed) return false;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return new Date(task.date) < today;
};

// Форматирование даты в вид ДД.ММ.ГГГГ
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
};

// ==================== ЛОГИКА ЗВУКОВ И ФОНА ====================
const TASK_SOUND_KEYWORDS = [
  { keyword: 'kill dragon', sound: 'challenge' }, { keyword: 'pig', sound: 'pig' },
  { keyword: 'cow', sound: 'cow' }, { keyword: 'cat', sound: 'cat' },
  { keyword: 'dog', sound: 'wolf' }, { keyword: 'wolf', sound: 'wolf' },
  { keyword: 'sheep', sound: 'sheep' }, { keyword: 'skeleton', sound: 'skeleton' },
  { keyword: 'enderman', sound: 'enderman' }, { keyword: 'zombie', sound: 'zombie' }
];

// Поиск звука по ключевому слову в тексте задачи
const getTaskSound = (text) => {
  if (!text) return 'done';
  const match = TASK_SOUND_KEYWORDS.find(({ keyword }) => text.toLowerCase().includes(keyword));
  return match ? match.sound : 'done';
};

// Проверка наличия выполненной задачи "kill dragon" 
const hasCompletedDragonKill = (tasks) => tasks.some(task => task.completed && task.text.toLowerCase().includes('kill dragon'));

// Переключение фонового видео при выполнении "kill dragon" 
const updateBackground = () => {
  const videoBg = document.getElementById('video-bg');
  if (!videoBg) return;
  const shouldShowVideo = hasCompletedDragonKill(state.tasks);
  const isActive = videoBg.classList.contains('active');

  if (shouldShowVideo && !isActive) {
    videoBg.classList.add('active');
    videoBg.play().catch(console.warn);
  } else if (!shouldShowVideo && isActive) {
    videoBg.classList.remove('active');
    videoBg.pause(); videoBg.currentTime = 0;
  }
};

// ==================== ЭФФЕКТЫ ИНТЕРФЕЙСА ====================
// Анимация тряски экрана при удалении задачи
const triggerExplosion = (element) => {
  document.body.classList.add('screen-shake');
  setTimeout(() => document.body.classList.remove('screen-shake'), 400);
};

// Создание анимированной частицы-ноты (с автоматической очисткой DOM для предотвращения утечек памяти)
const createNoteParticle = (x, y) => {
  const note = document.createElement('div');
  note.className = 'note-particle';
  note.textContent = '♪';
  note.style.left = `${x}px`; note.style.top = `${y}px`;
  note.style.color = `hsl(${Math.random() * 360}, 100%, 60%)`;
  document.body.appendChild(note);
  setTimeout(() => note.remove(), 2000);
};

let noteInterval = null;
// Запуск генерации нот вокруг проигрывателя
const startNoteParticles = () => {
  const jukeboxImg = document.querySelector('.jukebox-img');
  if (!jukeboxImg) return;
  const rect = jukeboxImg.getBoundingClientRect();
  noteInterval = setInterval(() => {
    createNoteParticle(rect.left + rect.width / 2 + (Math.random() - 0.5) * 60, rect.top);
  }, 500);
};

// Остановка генерации нот
const stopNoteParticles = () => {
  if (noteInterval) { clearInterval(noteInterval); noteInterval = null; }
};

// Управление видимостью танцующих попугаев
const showDancingParrots = () => {
  document.getElementById('parrot-left')?.classList.add('visible');
  document.getElementById('parrot-right')?.classList.add('visible');
};

const hideDancingParrots = () => {
  document.getElementById('parrot-left')?.classList.remove('visible');
  document.getElementById('parrot-right')?.classList.remove('visible');
};

// ==================== МОДАЛЬНОЕ ОКНО ПРОИГРЫВАТЕЛЯ ====================
const openJukeboxModal = () => {
  document.getElementById('jukebox-overlay').classList.add('active');
};

const closeJukeboxModal = () => {
  document.getElementById('jukebox-overlay').classList.remove('active');
  jukeboxMusic.pause(); jukeboxMusic.currentTime = 0; isMusicPlaying = false;
  stopNoteParticles(); hideDancingParrots();
  document.getElementById('music-disc').querySelector('.disc-img').classList.remove('spinning');
  const status = document.getElementById('jukebox-status');
  status.textContent = '???'; status.classList.remove('playing');
};

// Drag-and-Drop для музыкального диска
const setupJukeboxDragDrop = () => {
  const disc = document.getElementById('music-disc');
  const dropZone = document.getElementById('jukebox-drop');
  const discImg = disc.querySelector('.disc-img');
  const status = document.getElementById('jukebox-status');

  disc.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', 'disc');
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => disc.style.opacity = '0.5', 0);
  });
  disc.addEventListener('dragend', () => disc.style.opacity = '1');
  
  dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
  
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault(); dropZone.classList.remove('drag-over');
    if (e.dataTransfer.getData('text/plain') === 'disc' && !isMusicPlaying) {
      jukeboxMusic.currentTime = 0; jukeboxMusic.play().catch(console.warn);
      isMusicPlaying = true; discImg.classList.add('spinning');
      status.textContent = 'Now Playing: Otherside '; status.classList.add('playing');
      startNoteParticles(); showDancingParrots(); soundManager.play('click');
    }
  });
};

// ==================== РЕНДЕРИНГ И ОБРАБОТЧИКИ СОБЫТИЙ ====================
// использование reduce для сборки HTML-строки из массива данных
const render = () => {
  const taskListEl = document.getElementById('task-list');
  const sortedTasks = sortTasks(getFilteredTasks(state.tasks, state.filter));
  
  taskListEl.innerHTML = sortedTasks.reduce((acc, task) => {
    const overdueClass = isOverdue(task) ? 'overdue' : '';
    const completedClass = task.completed ? 'completed' : '';
    const checkedClass = task.completed ? 'checked' : '';
    const diamondIcon = task.isImportant ? `<img src="assets/visuals/diamond.png" alt="" class="task-diamond">` : '';
    const dateDisplay = task.date ? `<span class="task-date"><img src="assets/visuals/clock.gif" alt="" class="task-clock">${formatDate(task.date)}</span>` : '';
    
    return acc + `
      <div id="task-${task.id}" class="task-cell ${completedClass} ${overdueClass}">
        <div class="task-checkbox ${checkedClass}" onclick="handleToggle('${task.id}')" title="${task.completed ? 'Uncomplete' : 'Complete'}"></div>
        ${diamondIcon}
        <span class="task-text">${task.text}</span>
        ${dateDisplay}
        <div class="task-actions">
          <button class="btn-tnt" onclick="handleDelete('${task.id}')" title="Delete"><img src="assets/visuals/tnt.png" alt=""></button>
        </div>
      </div>`;
  }, '') || '<div style="text-align:center; color:#555; padding:2rem; font-size: 1.2rem; text-shadow: 1px 1px 0 #fff;">Task list is empty. Add a new task!</div>';
};

// Глобальные обработчики событий
window.handleToggle = (id) => {
  const task = state.tasks.find(t => t.id === id);
  if (task) soundManager.play(task.completed ? 'damage' : getTaskSound(task.text));
  setState({ tasks: toggleTask(state.tasks, id) });
  updateBackground();
};

window.handleDelete = (id) => {
  const element = document.getElementById(`task-${id}`);
  if (!element) return;
  soundManager.play('explosion');
  triggerExplosion(element);
  element.style.visibility = 'hidden';
  setTimeout(() => { 
    setState({ tasks: deleteTask(state.tasks, id) }); 
    updateBackground(); 
  }, 100);
};

const handleAdd = () => {
  const input = document.getElementById('task-input');
  const dateInput = document.getElementById('date-input');
  const diamondInput = document.getElementById('diamond-input');
  const text = input.value.trim();
  if (!text) return;
  
  soundManager.play('click');
  setState({ tasks: addTask(state.tasks, text, dateInput.value, diamondInput.checked) });
  
  // Очистка формы
  input.value = ''; dateInput.value = ''; diamondInput.checked = false;
  diamondInput.nextElementSibling.classList.remove('active');
};

const handleFilter = (filterType) => {
  soundManager.play('click');
  setState({ filter: filterType });
};

// ==================== ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ ====================
document.addEventListener('DOMContentLoaded', () => {
  // Привязка событий к кнопке добавления
  document.getElementById('add-btn').addEventListener('click', handleAdd);
  document.getElementById('task-input').addEventListener('keypress', (e) => { if (e.key === 'Enter') handleAdd(); });
  
  // Делегирование и обработка кликов по кнопкам фильтров
  document.querySelectorAll('.filters .mc-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filters .mc-btn').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      handleFilter(e.currentTarget.dataset.filter);
    });
  });

  // Обработка переключения чекбокса с алмазом
  const diamondInput = document.getElementById('diamond-input');
  diamondInput.addEventListener('change', (e) => {
    soundManager.play('click');
    e.target.nextElementSibling.classList.toggle('active', e.target.checked);
  });

  // События для пасхалки с проигрывателем
  document.getElementById('jukebox-cat').addEventListener('click', openJukeboxModal);
  document.getElementById('jukebox-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'jukebox-overlay') closeJukeboxModal();
  });

  setupJukeboxDragDrop();
  updateBackground();
  render();
});