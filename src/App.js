import React, { useState, useEffect } from 'react';
import { Plus, User, BookOpen, CheckCircle, XCircle, LogOut, Eye, EyeOff } from 'lucide-react';
import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';


const StudentQuotaApp = () => {
  // Data siswa dengan password - KOSONG di awal
  const [students, setStudents] = useState([]);

useEffect(() => {
  const fetchStudents = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "students"));
      const fetched = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStudents(fetched);
    } catch (error) {
      console.error("❌ Gagal mengambil data dari Firestore:", error);
    }
  };

  fetchStudents();
}, []);


  // Admin credentials
  const adminCredentials = { username: 'admin', password: 'admin123' };

  // State management
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'admin' or 'student'
  const [showLogin, setShowLogin] = useState(true);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Modal states
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAddQuota, setShowAddQuota] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [newStudent, setNewStudent] = useState({ name: '', password: '', totalQuota: '' });
  const [additionalQuota, setAdditionalQuota] = useState('');
  useEffect(() => {
    localStorage.setItem("students", JSON.stringify(students));
  }, [students]);

  // Login handler
  const handleLogin = () => {
    const user = students.find(
      s => s.name === loginForm.username && s.password === loginForm.password
    );

    if (user) {
      setCurrentUser(user);
      setUserRole('student');
      setShowLogin(false);
    } else {
      setLoginError("ID atau password salah.");
    }
  };

  // Logout handler
  const handleLogout = () => {
    setCurrentUser(null);
    setUserRole(null);
    setShowLogin(true);
    setLoginForm({ username: '', password: '' });
    setLoginError('');
  };

  // Admin functions
  const addStudent = async () => {
    if (newStudent.name && newStudent.password && newStudent.totalQuota) {
      const studentData = {
        name: newStudent.name,
        password: newStudent.password,
        quotaUsed: 0,
        totalQuota: parseInt(newStudent.totalQuota),
      };

      try {
      // ⬇️ Tambahkan ke Firestore
        const docRef = await addDoc(collection(db, "students"), studentData);

      // ⬇️ Tambahkan juga ke local state agar UI langsung update
        setStudents(prev => [...prev, { id: docRef.id, ...studentData }]);

      // Reset form dan modal
        setNewStudent({ name: '', password: '', totalQuota: '' });
        setShowAddStudent(false);

      } catch (error) {
        console.error("❌ Gagal menambahkan ke Firestore:", error);
      }
    }
  };

  const addQuota = () => {
    if (selectedStudent && additionalQuota && parseInt(additionalQuota) > 0) {
      setStudents(prevStudents => 
        prevStudents.map(student => 
          student.id === selectedStudent.id 
            ? { ...student, totalQuota: student.totalQuota + parseInt(additionalQuota) }
            : student
        )
      );
      setAdditionalQuota('');
      setShowAddQuota(false);
      setSelectedStudent(null);
    }
  };

  const handleuseQuota = (studentId) => {
    setStudents(prevStudents => 
      prevStudents.map(student => 
        student.id === studentId && student.quotaUsed < student.totalQuota
          ? { ...student, quotaUsed: student.quotaUsed + 1 }
          : student
      )
    );
  };

  // Utility functions
  const getQuotaStatus = (student) => {
    return student.quotaUsed >= student.totalQuota;
  };

  const getProgressPercentage = (student) => {
    return (student.quotaUsed / student.totalQuota) * 100;
  };

  // Login Screen
  if (showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <BookOpen className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800">Sistem Kuota Pembelajaran</h1>
            <p className="text-gray-600 mt-2">Silakan login untuk melanjutkan</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username / Nama Siswa
              </label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan username atau nama"
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                  placeholder="Masukkan password"
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {loginError}
              </div>
            )}

            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Student View
  if (userRole === 'student') {
    const studentData = students.find(s => s.id === currentUser.id);
    if (!studentData) {
      handleLogout();
      return null;
    }
    
    const isQuotaExhausted = getQuotaStatus(studentData);
    const progressPercentage = getProgressPercentage(studentData);

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Halo, {currentUser.name}!</h1>
                  <p className="text-gray-600">Dashboard Kuota Pembelajaran Anda</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>

          {/* Student Quota Card */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="bg-blue-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Status Kuota Pembelajaran</h2>
            </div>

            {/* Progress Circle */}
            <div className="mb-6">
              <div className="flex justify-between text-lg mb-4">
                <span className="text-gray-600">Kuota Terpakai</span>
                <span className="font-bold text-2xl">{studentData.quotaUsed}/{studentData.totalQuota}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-6">
                <div 
                  className={`h-6 rounded-full transition-all duration-500 ${
                    progressPercentage >= 100 ? 'bg-red-500' : 
                    progressPercentage >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                ></div>
              </div>
              <div className="text-center mt-2 text-sm text-gray-600">
                {Math.round(progressPercentage)}% terpakai
              </div>
            </div>

            {/* Status Badge */}
            <div className="text-center mb-6">
              <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full text-lg font-medium ${
                isQuotaExhausted 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {isQuotaExhausted ? (
                  <>
                    <XCircle className="w-6 h-6" />
                    Kuota Sudah Habis
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-6 h-6" />
                    Kuota Masih Tersedia
                  </>
                )}
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-800 mb-2">Informasi:</h3>
              <p className="text-gray-600 text-sm">
                {isQuotaExhausted 
                  ? "Kuota pembelajaran Anda sudah habis. Silakan hubungi guru untuk menambah kuota."
                  : `Anda masih memiliki ${studentData.totalQuota - studentData.quotaUsed} sesi pembelajaran tersisa.`
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Admin View
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Panel Admin - Manajemen Kuota</h1>
                <p className="text-gray-600">Kelola kuota pembelajaran semua siswa</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Selamat datang, {currentUser.name}</span>
              <button
                onClick={() => setShowAddStudent(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Tambah Siswa
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {students.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Belum Ada Siswa</h3>
            <p className="text-gray-600 mb-6">Tambahkan siswa pertama untuk memulai</p>
            <button
              onClick={() => setShowAddStudent(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tambah Siswa Pertama
            </button>
          </div>
        ) : (
          /* Student Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map(student => {
              const isQuotaExhausted = getQuotaStatus(student);
              const progressPercentage = getProgressPercentage(student);
              
              return (
                <div key={student.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{student.name}</h3>
                        <p className="text-sm text-gray-600">ID: {student.id} | Pass: {student.password}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isQuotaExhausted ? (
                        <XCircle className="w-6 h-6 text-red-500" />
                      ) : (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Kuota Terpakai</span>
                      <span className="font-medium">{student.quotaUsed}/{student.totalQuota}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-300 ${
                          progressPercentage >= 100 ? 'bg-red-500' : 
                          progressPercentage >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="mb-4">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                      isQuotaExhausted 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {isQuotaExhausted ? (
                        <>
                          <XCircle className="w-4 h-4" />
                          Kuota Habis
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Kuota Tersedia
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleuseQuota(student.id)}
                      disabled={isQuotaExhausted}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isQuotaExhausted
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      Gunakan Kuota
                    </button>
                    <button
                      onClick={() => {
                        setSelectedStudent(student);
                        setShowAddQuota(true);
                      }}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Student Modal */}
        {showAddStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Tambah Siswa Baru</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Siswa *
                  </label>
                  <input
                    type="text"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Masukkan nama siswa"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password Siswa *
                  </label>
                  <input
                    type="text"
                    value={newStudent.password}
                    onChange={(e) => setNewStudent({...newStudent, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Masukkan password siswa"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Kuota *
                  </label>
                  <input
                    type="number"
                    value={newStudent.totalQuota}
                    onChange={(e) => setNewStudent({...newStudent, totalQuota: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Masukkan jumlah kuota"
                    min="1"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddStudent(false);
                    setNewStudent({ name: '', password: '', totalQuota: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={addStudent}
                  disabled={!newStudent.name || !newStudent.password || !newStudent.totalQuota}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Tambah
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Quota Modal */}
        {showAddQuota && selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Tambah Kuota</h3>
              <p className="text-gray-600 mb-4">
                Siswa: <span className="font-medium">{selectedStudent.name}</span>
              </p>
              <p className="text-gray-600 mb-4">
                Kuota saat ini: <span className="font-medium">{selectedStudent.totalQuota}</span>
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kuota Tambahan *
                </label>
                <input
                  type="number"
                  value={additionalQuota}
                  onChange={(e) => setAdditionalQuota(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan kuota tambahan"
                  min="1"
                  required
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddQuota(false);
                    setSelectedStudent(null);
                    setAdditionalQuota('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={addQuota}
                  disabled={!additionalQuota || parseInt(additionalQuota) <= 0}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Tambah Kuota
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentQuotaApp
