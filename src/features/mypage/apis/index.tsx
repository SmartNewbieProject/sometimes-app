import { axiosClient, fileUtils } from "@/src/shared/libs";
import { nanoid } from 'nanoid';

type RematchingTicket = {
    total: number;
}

type MyRematchingTicket = {
    id: number;
    name: string;
}

export type Mbti = {
    mbti: string | null;
}


const getMyRematchingTicket = async (): Promise<MyRematchingTicket[]> => {
    return await axiosClient.get('/tickets/rematching');
}

const getAllRematchingTicket = async (): Promise<RematchingTicket> => {
    const myRematchingTickets = await getMyRematchingTicket();
    return { total: myRematchingTickets.length };
}

const getMbti = async (): Promise<Mbti> => {
    return await axiosClient.get('/profile/mbti');
};

const updateMbti = async (mbti: string): Promise<void> => {
    return await axiosClient.patch('/profile/mbti', { mbti });
};

// 프로필 이미지 삭제
const deleteProfileImage = async (imageId: string): Promise<void> => {
    return await axiosClient.delete(`/profile/images/${imageId}`);
};

// 프로필 이미지 업로드 (단일 이미지)
const uploadProfileImage = async (image: string, isMain: number): Promise<void> => {
    const formData = new FormData();

    const blob = fileUtils.dataURLtoBlob(image);
    const file = fileUtils.toFile(blob, `profile-${nanoid(6)}.png`);

    formData.append('files', file);
    formData.append('isMain', isMain.toString());

    return axiosClient.post('/profile/images', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

// 프로필 이미지 업로드 (여러 이미지) - 기존 호환성을 위해 유지
const uploadProfileImages = async (images: string[]): Promise<void> => {
    const formData = new FormData();

    const files = images
        .filter(image => image !== null)
        .map(fileUtils.dataURLtoBlob)
        .map(blob => fileUtils.toFile(blob, `profile-${nanoid(6)}.png`));

    for (const file of files) {
        formData.append('files', file);
    }

    // 첫 번째 이미지를 메인으로 설정
    formData.append('isMain', '0');

    return axiosClient.post('/profile/images', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

type Service = {
    getMyRematchingTicket: () => Promise<MyRematchingTicket[]>;
    getAllRematchingTicket: () => Promise<RematchingTicket>;
    getMbti: () => Promise<Mbti>;
    updateMbti: (mbti: string) => Promise<void>;
    deleteProfileImage: (imageId: string) => Promise<void>;
    uploadProfileImage: (image: string, isMain: number) => Promise<void>;
    uploadProfileImages: (images: string[]) => Promise<void>;
}

const apis: Service = {
    getMyRematchingTicket,
    getAllRematchingTicket,
    getMbti,
    updateMbti,
    deleteProfileImage,
    uploadProfileImage,
    uploadProfileImages,
}

export default apis;
