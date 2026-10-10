import React from 'react'
import { Route, Routes } from 'react-router'
import Dashboard from '../pages/Dashboard'
import Student_profile from '../pages/Student_profile'
import Student_segmentation from '../pages/Student_segmentation'
import Sudent_directory from '../pages/Sudent_directory'
import At_risk_student from '../pages/At_risk_student'

function AppRoute() {
  return (
    <Routes>
      <Route path='/' element={<Dashboard/>} />
      <Route path='/profile' element={<Student_profile/>} />
      <Route path='/segmentation' element={<Student_segmentation/>} />
      <Route path='/directory' element={<Sudent_directory/>} />
      <Route path='/risks' element={<At_risk_student/>} />
    </Routes>
  )
}

export default AppRoute