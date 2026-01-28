// import React from 'react'
import { Routes, Route } from 'react-router-dom';

import CodeshareHome from './page/codeshareHome';
import Home from './page/home'


export const App = () => {
  return (
    <>

      {<Routes>
        <Route path="/" element={<CodeshareHome />} />
        <Route path="/:room" element={<Home />} />

      </Routes>}

    </>

  )
}

export default App;
