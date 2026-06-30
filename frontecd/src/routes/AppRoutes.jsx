import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import PrivateRoute from './PrivateRoute';
import Home from '../pages/Home2';
import Login from '../pages/Login';
import WatchMovie from '../pages/Watch3';
import Register from '../pages/Register'
import MovieListManager from '../pages/MovieListManager'
import EpisodeListManager from '../pages/EpisodeListManager'
import VideoQualityListManager from '../pages/VideoQualityListManager'
import UserListManager from '../pages/UserListManager'
import MovieDetail from '../pages/MovieDetail';

const AdminDashboard = () => {
    return (
        <div className='text-white p-8'>
            <h2 className='text-2xl font-bold text-black'>Hệ thống quản trị nội dung phim</h2>
        </div>
    );
};

const AppRoutes = () => {
    return (
        <Routes>
            {/* Cụm User & Guest (Có Header/Footer chung của khách) */}
            <Route path='/' element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="watch/:movieId" element={<WatchMovie />} />
                <Route path="movie/:id" element={<MovieDetail />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
            </Route>

            {/* Cụm Admin Protected Routes */}
            <Route
                path="/admin"
                element={
                    <PrivateRoute requireAdmin={true}>
                        <AdminLayout />
                    </PrivateRoute>
                }
            >
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="movies" element={<MovieListManager />} />
                <Route path="movies/:movieId/episodes" element={<EpisodeListManager />} />
                <Route path="movies/:movieId/episodes/:episodeId/video-qualities" element={<VideoQualityListManager />} />
                <Route path='users' element={<UserListManager />} />
            </Route>

            {/* 404 Not Found: Bẫy lỗi gõ sai đường dẫn tuyệt đối */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;
