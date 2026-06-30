import { message, Table, Tag, Space, Button, Popconfirm, Modal, Form, Input, InputNumber, Select } from 'antd';
import episodeService from '../services/episodeService';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

const EpisodeList = () => {
    const { movieId } = useParams();
    const [form] = Form.useForm();

    const [listState, setListState] = useState({
        data: [],
        loading: true,
        pagination: { current, pageSize: 10, total: 0 }
    });

    const [modalState, setModalState] = useState({
        isOpen: false,
        editingRecord: null,
        submitting: false
    });

    const fetchEpisodes = async (page = 0, size = 10) => {
        if (!movieId || movieId === "undefined") {
            console.log("Chưa tìm thấy movieId hợp lệ");
            return;
        }

        setListState(prev => ({ ...prev, loading: true }));
        try {
            const resData = await episodeService.getAllEpisodesByMovieForAdmin(movieId, page, size);
            setListState({
                data: resData.content || [],
                loading: false,
                pagination: {
                    current: resData.page.number + 1,
                    pageSize: resData.page.size,
                    total: resData.page.totalElements
                }
            });
        } catch (err) {
            message.err(err.message || "Không thể tải danh sách episodes");
            setListState(prev => ({ ...prev, loading: false }));
        }
    };
    useEffect(() => {
        fetchEpisodes(0, listState.pagination.pageSize)
    }, [movieId]);

    const columns = [
        {
            title: "Id",
            dataIndex: "id",
            key: "id",
            width: 70
        },
        {
            title: "Tập phim",
            dataIndex: "episodeNumber",
            width: 100,
            render: (num) => <b>Tập {num}</b>
        },
        {
            title: "Tiêu đề",
            dataIndex: "title",
            key: "title"
        },
        {
            title: "Lượt xem",
            dataIndex: "status",
            key: "status",
            width: 160,
            render: (status) => {
                if (!status) return <Tag color="default">Không xác định</Tag>
                const textDisplay = status.displayName || status.code;
                const color = status.code === 'PROCESSING' ? 'orange' : 'green';
                return <Tag color={color}>{textDisplay}</Tag>;
            }
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => formatDateTime(date)
        },
        {
            title: 'Ngày cập nhật',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            render: (date) => formatDateTime(date) 
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 160,
            render: (_, record) => (
                <Space size="small">
                    <Button 
                        type="primary" 
                        ghost 
                        size="small" 
                        icon={<EditOutlined />} 
                        onClick={() => showEditModal(record)} // Gọi hàm truyền trọn vẹn dữ liệu hàng để sửa
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Xóa tập phim"
                        description="Bạn có chắc chắn muốn xóa tập phim này khỏi hệ thống không?"
                        onConfirm={() => handleDeleteEpisode(record.id)}
                        okText="Có, xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button type="primary" danger size="small" icon={<DeleteOutlined />}>
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];
    return (
        <div className='p-6'>
            <div className='flex justify-space-between m-b m-4'>

            </div>
        </div>
    );
};

export default EpisodeList;