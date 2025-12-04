import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "@/src/shared/libs";
import type { UserProfile } from "@/src/types/user";

// Use the working /profile API instead of /user/details
const getMyDetails = (): Promise<UserProfile> => {
  console.log('🔍 [getMyDetails] Making API call to /profile');

  // 직접 API 테스트
  return fetch('/api/profile', {
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjNmNzY1OWQ1LWY0ZmQtNDk2OC1iMjllLTk5YzczNzc3ZmI1NyIsInBob25lTnVtYmVyIjoiMDEwLTQxODItNzYwNSIsIm5hbWUiOiLqsITssYTslYQiLCJyb2xlcyI6WyJhZG1pbiJdLCJnZW5kZXIiOiJNQUxFIiwidHlwZSI6ImFjY2VzcyIsImVtYWlsIjoidGVzdDFAdGVzdC5jb20iLCJ1c2VyUHJvZmlsZUlkIjoiZWY0YjljMTEtYTY5Yi00ZDNmLWEwZGUtZDgwZmQwNmE5YWQ1IiwiaWF0IjoxNzY0NDk1NDYwLCJleHAiOjE3NjUxMDAyNjB9.0VsTst6hXfaGL9jCvFaQKcGlyTP3dXjdpFfOs1a4NOk',
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => {
    console.log('🔍 [getMyDetails] Direct fetch response:', data);
    return data.data; // { success: true, data: ... } 형태이므로 .data 반환
  })
  .catch(error => {
    console.log('🔍 [getMyDetails] Direct fetch error:', error);
    // fallback to axiosClient
    return axiosClient.get('/profile');
  });
};

export const useMyDetailsQuery = (enabled: boolean) => {
  const { data, ...props } = useQuery({
    queryKey: ['my-details'],
    queryFn: getMyDetails,
    enabled,
  });

  // 디버깅용 콘솔 출력
  console.log('🔍 [useMyDetailsQuery] Debug data:', {
    enabled,
    data: data,
    isLoading: props.isLoading,
    isError: props.isError,
    error: props.error
  });

  return { my: data, ...props };
};
