'use client';
export default function Home() {
  return (
    <div>
      <div className="font-mono text-5xl grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-16 pb-20 gap-16 sm:p-60">
        {/* Test Font */}
      </div>

      <div id="mouseDiv" style={{
        height: '25px',
        width: '25px',
        backgroundColor: 'rgb(255,255,255)',
        borderRadius: '50%',
        display: 'inline-block',
      }}></div>

    </div>
  );
}
