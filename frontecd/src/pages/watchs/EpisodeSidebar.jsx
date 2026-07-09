import React from 'react';

const EpisodeSidebar = ({ episodes, activeEpisodeId, onEpisodeChange, setMovieState }) => {
    return (
        <div className="col-span-1 order-2 bg-[#1a1c23] border border-gray-800 rounded-lg p-4 h-fit max-h-[600px] flex flex-col">
            <div className="flex gap-2 border-b border-gray-800 pb-3 mb-3">
                <button className="bg-cyan-500 text-black text-xs font-bold px-3 py-1.5 rounded shadow">
                    Vietsub
                </button>
            </div>
            
            <div className="overflow-y-auto pr-1 flex-1 style-scrollbar grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {episodes.length > 0 ? (
                    episodes.map((ep) => (
                        <button
                            key={`ep-grid-${ep.id}`}
                            onClick={() => onEpisodeChange(ep)}
                            className={`relative py-2 text-center text-xs font-bold rounded transition-all cursor-pointer border ${
                                activeEpisodeId === ep.id
                                    ? 'bg-cyan-500/14 text-gray-300 border-cyan-400 shadow-md font-black before:content-[""] before:absolute before:left-0 before:top-0 before:bottom-0.5 before:w-1 before:bg-gradient-to-b before:from-cyan-400 before:to-blue-600 before:rounded-l after:content-[""] after:absolute after:right-2 after:top-1/2 after:-translate-y-1/2 after:w-1.5 after:h-1.5 after:bg-blue-500 after:rounded-full after:shadow-[0_0_6px_#03a9f4]'
                                    : 'bg-[#222531] text-gray-300 border-gray-500 hover:border-cyan-500/40 hover:text-cyan-400'
                            }`}
                        >
                            {ep.episodeNumber}
                        </button>
                    ))
                ) : (
                    <div className="col-span-6 text-center text-gray-500 italic text-xs py-4">
                        Chưa có tập phim
                    </div>
                )}
            </div>
        </div>
    );
};

// Bọc React.memo để bảo vệ component khỏi re-render thừa
export default React.memo(EpisodeSidebar);
