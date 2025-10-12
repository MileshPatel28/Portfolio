'use client';

import { useEffect } from "react";

export default function Home() {

  useEffect(() => {

      addEventListener('scroll', () => {
        const scrollY = window.scrollY;
    
        // const mainCanvas = document.getElementById('mainScene')
    
        // if(mainCanvas != null){
        //   mainCanvas.style.opacity = (1 - scrollY/ document.body.scrollHeight).toString();
        // }

      })

  },[])

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
     Milesh Patel
    </div>
  );
}
