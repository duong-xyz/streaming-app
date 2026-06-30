import React from 'react';

const EpisodeSidebar = ({ episodes, activeEpisodeId, onEpisodeChange }) => {
    return (
        <div className="order-2 lg:order-none lg:col-span-1 bg-[#1a1c23] border border-gray-800 rounded-lg p-4 h-fit max-h-[600px] flex flex-col">
            <div className="flex gap-2 border-b border-gray-800 pb-3 mb-3">
                <button className="bg-cyan-500 text-black text-xs font-bold px-3 py-1.5 rounded shadow">
                    Vietsub
                </button>
            </div>
            
            <div className="overflow-y-auto pr-1 flex-1 style-scrollbar grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-4 gap-2">
                {episodes.length > 0 ? (
                    episodes.map((ep) => (
                        <button
                            key={`ep-grid-${ep.id}`}
                            onClick={() => onEpisodeChange(ep)}
                            className={`py-2 text-center text-xs font-bold rounded transition-all cursor-pointer border ${
                                activeEpisodeId === ep.id
                                    ? 'bg-cyan-500 text-black border-cyan-400 shadow-md font-black'
                                    : 'bg-[#222531] text-gray-300 border-gray-800 hover:border-cyan-500/40 hover:text-cyan-400'
                            }`}
                        >
                            {ep.episodeNumber}
                        </button>
                    ))
                ) : (
                    <div className="col-span-4 text-center text-gray-500 italic text-xs py-4">
                        Chưa có tập phim
                    </div>
                )}
            </div>
        </div>
    );
};

// Bọc React.memo để bảo vệ component khỏi re-render thừa
export default React.memo(EpisodeSidebar);
