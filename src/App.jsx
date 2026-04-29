import { useState } from 'react'
import { Routes, Route, Navigate, Link } from 'react-router-dom'
import { BookOpen, Users, GraduationCap, FileText, LogOut, Book, Settings } from 'lucide-react'
import { useAuth } from './context/AuthContext'
import Login from './components/Login'
import Register from './components/Register'
import ProtectedRoute from './components/ProtectedRoute'
import data from '../data.json'

// Navbar Component
export function Navbar() {
  const { user, logout } = useAuth()

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <BookOpen />
        <span>Mini LMS</span>
      </div>
      <div className="navbar-links">
        {user && (
          <>
            <span>{user.name}</span>
            <button onClick={logout} className="btn btn-secondary btn-sm">
              <LogOut size={16} /> Logout
            </button>
          </>
        )}
      </div>
    </nav>
  )
}

// Sidebar Component
export function Sidebar() {
  const { user } = useAuth()

  const links = user?.role === 'admin' 
    ? [
        { to: '/dashboard', icon: Settings, label: 'Dashboard' },
        { to: '/students', icon: Users, label: 'Students' },
        { to: '/courses', icon: Book, label: 'Courses' }
      ]
    : user?.role === 'instructor'
    ? [
        { to: '/dashboard', icon: Settings, label: 'Dashboard' },
        { to: '/courses', icon: Book, label: 'My Courses' },
        { to: '/quizzes', icon: FileText, label: 'Quizzes' }
      ]
    : [
        { to: '/dashboard', icon: Settings, label: 'Dashboard' },
        { to: '/courses', icon: Book, label: 'Enrolled Courses' },
        { to: '/quizzes', icon: FileText, label: 'My Quizzes' }
      ]

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {links.map(link => (
          <Link key={link.to} to={link.to} className="sidebar-link">
            <link.icon size={20} />
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}

// Admin Dashboard
export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('courses')
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [courses, setCourses] = useState(data.courses)
  const [students, setStudents] = useState(data.users.filter(u => u.role === 'student'))
  const [form, setForm] = useState({})

  const handleSave = (e) => {
    e.preventDefault()
    if (activeTab === 'courses') {
      if (editItem) {
        setCourses(courses.map(c => c.id === editItem.id ? { ...form, id: c.id, instructorId: 2 } : c))
      } else {
        setCourses([...courses, { ...form, id: courses.length + 1, instructorId: 2 }])
      }
    } else {
      if (editItem) {
        setStudents(students.map(s => s.id === editItem.id ? { ...form, id: s.id } : s))
      } else {
        setStudents([...students, { ...form, id: students.length + 4, role: 'student' }])
      }
    }
    setShowModal(false)
    setEditItem(null)
    setForm({})
  }

  const handleDelete = (id) => {
    if (confirm('Are you sure?')) {
      if (activeTab === 'courses') {
        setCourses(courses.filter(c => c.id !== id))
      } else {
        setStudents(students.filter(s => s.id !== id))
      }
    }
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Admin Dashboard</h1>
          <p className="dashboard-subtitle">Manage students and courses</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{students.length}</div>
            <div className="stat-label">Students</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{courses.length}</div>
            <div className="stat-label">Courses</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{data.quizzes.length}</div>
            <div className="stat-label">Quizzes</div>
          </div>
        </div>

        <div className="btn-group">
          <button 
            className={`btn ${activeTab === 'courses' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('courses')}
          >
            Courses
          </button>
          <button 
            className={`btn ${activeTab === 'students' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('students')}
          >
            Students
          </button>
        </div>

        <div className="card-grid">
          {activeTab === 'courses' && courses.map(course => (
            <div key={course.id} className="card course-card">
              <h3 className="course-title">{course.title}</h3>
              <p className="course-description">{course.description}</p>
              <div className="course-meta">
                <span>{course.materials?.length || 0} materials</span>
              </div>
              <div className="course-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => { setEditItem(course); setForm(course); setShowModal(true) }}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(course.id)}>Delete</button>
              </div>
            </div>
          ))}
          {activeTab === 'students' && students.map(student => (
            <div key={student.id} className="card">
              <h3>{student.name}</h3>
              <p>{student.email}</p>
              <div className="course-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => { setEditItem(student); setForm(student); setShowModal(true) }}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(student.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>

        <button className="btn btn-primary" style={{marginTop: '1.5rem'}} onClick={() => { setEditItem(null); setForm({}); setShowModal(true) }}>
          Add {activeTab === 'courses' ? 'Course' : 'Student'}
        </button>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">{editItem ? 'Edit' : 'Add'} {activeTab === 'courses' ? 'Course' : 'Student'}</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
              </div>
              <form onSubmit={handleSave}>
                {activeTab === 'courses' ? (
                  <>
                    <div className="form-group">
                      <label className="form-label">Title</label>
                      <input className="form-input" value={form.title || ''} onChange={e => setForm({...form, title: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Description</label>
                      <textarea className="form-textarea" value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="form-group">
                      <label className="form-label">Name</label>
                      <input className="form-input" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input className="form-input" type="email" value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} required />
                    </div>
                  </>
                )}
                <button type="submit" className="btn btn-primary">Save</button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

// Instructor Dashboard
export function InstructorDashboard() {
  const [courses] = useState(data.courses)
  const [quizzes] = useState(data.quizzes)

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Instructor Dashboard</h1>
          <p className="dashboard-subtitle">Manage your courses and quizzes</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{courses.length}</div>
            <div className="stat-label">Courses</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{quizzes.length}</div>
            <div className="stat-label">Quizzes</div>
          </div>
        </div>

        <h2 style={{marginBottom: '1rem'}}>My Courses</h2>
        <div className="card-grid">
          {courses.map(course => (
            <div key={course.id} className="card course-card">
              <h3 className="course-title">{course.title}</h3>
              <p className="course-description">{course.description}</p>
              <div className="course-meta">
                <span>{course.materials?.length || 0} materials</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

// Student Dashboard
export function StudentDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('courses')
  const enrolledCourseIds = data.enrollments.filter(e => e.studentId === user?.id).map(e => e.courseId)
  const enrolledCourses = data.courses.filter(c => enrolledCourseIds.includes(c.id))

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Welcome, {user?.name}!</h1>
          <p className="dashboard-subtitle">Your learning dashboard</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{enrolledCourses.length}</div>
            <div className="stat-label">Enrolled Courses</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{data.quizResults.filter(r => r.studentId === user?.id).length}</div>
            <div className="stat-label">Quizzes Taken</div>
          </div>
        </div>

        <div className="btn-group">
          <button 
            className={`btn ${activeTab === 'courses' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('courses')}
          >
            My Courses
          </button>
          <button 
            className={`btn ${activeTab === 'quizzes' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('quizzes')}
          >
            Quizzes
          </button>
        </div>

        {activeTab === 'courses' && (
          <div className="card-grid">
            {enrolledCourses.length === 0 ? (
              <div className="empty-state">No courses enrolled yet</div>
            ) : enrolledCourses.map(course => (
              <div key={course.id} className="card course-card">
                <h3 className="course-title">{course.title}</h3>
                <p className="course-description">{course.description}</p>
                <div className="course-meta">
                  <span>{course.materials?.length || 0} materials</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'quizzes' && (
          <div className="card-grid">
            {data.quizzes.map(quiz => {
              const course = data.courses.find(c => c.id === quiz.courseId)
              const result = data.quizResults.find(r => r.quizId === quiz.id && r.studentId === user?.id)
              return (
                <div key={quiz.id} className="card course-card">
                  <h3 className="course-title">{quiz.title}</h3>
                  <p className="course-description">{course?.title}</p>
                  <span className="badge badge-primary">{quiz.questions.length} questions</span>
                  {result ? (
                    <div className="badge badge-success">Score: {result.score}/{result.total}</div>
                  ) : (
                    <Link to={`/quiz/${quiz.id}`} className="btn btn-primary" style={{marginTop: '1rem'}}>
                      Take Quiz
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

// Quiz Component
export function QuizComponent({ quizId }) {
  const { user } = useAuth()
  const quiz = data.quizzes.find(q => q.id === parseInt(quizId))
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [showResult, setShowResult] = useState(false)

  if (!quiz) return <div className="quiz-container">Quiz not found</div>

  const handleSelect = (optionIndex) => {
    setAnswers({ ...answers, [currentQuestion]: optionIndex })
  }

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = () => {
    setShowResult(true)
  }

  const score = quiz.questions.reduce((acc, q, i) => acc + (answers[i] === q.correct ? 1 : 0), 0)

  if (showResult) {
    return (
      <div className="quiz-container">
        <div className="quiz-result">
          <h2>Quiz Complete!</h2>
          <div className="quiz-score">{score}/{quiz.questions.length}</div>
          <p>{score >= quiz.questions.length / 2 ? 'Great job!' : 'Keep practicing!'}</p>
          <Link to="/dashboard" className="btn btn-primary" style={{marginTop: '1rem'}}>
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const question = quiz.questions[currentQuestion]

  return (
    <div className="quiz-container">
      <div className="quiz-question">
        <div className="quiz-question-number">
          Question {currentQuestion + 1} of {quiz.questions.length}
        </div>
        <div className="quiz-question-text">{question.question}</div>
        <div className="quiz-options">
          {question.options.map((option, i) => (
            <div 
              key={i}
              className={`quiz-option ${answers[currentQuestion] === i ? 'selected' : ''}`}
              onClick={() => handleSelect(i)}
            >
              {option}
            </div>
          ))}
        </div>
      </div>
      <div style={{display: 'flex', justifyContent: 'space-between'}}>
        <button className="btn btn-secondary" onClick={handlePrev} disabled={currentQuestion === 0}>
          Previous
        </button>
        {currentQuestion === quiz.questions.length - 1 ? (
          <button className="btn btn-primary" onClick={handleSubmit}>
            Submit Quiz
          </button>
        ) : (
          <button className="btn btn-primary" onClick={handleNext}>
            Next
          </button>
        )}
      </div>
    </div>
  )
}

// Main App
export default function App() {
  const { user } = useAuth()

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
        <Route path="/dashboard" element={<ProtectedRoute>{user?.role === 'admin' ? <AdminDashboard /> : user?.role === 'instructor' ? <InstructorDashboard /> : <StudentDashboard />}</ProtectedRoute>} />
        <Route path="/students" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/courses" element={<ProtectedRoute roles={['admin', 'instructor']}><InstructorDashboard /></ProtectedRoute>} />
        <Route path="/quizzes" element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>} />
        <Route path="/quiz/:quizId" element={<ProtectedRoute roles={['student']}><QuizComponent /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      </Routes>
    </>
  )
}