import { router } from 'expo-router';
import { Linking } from 'react-native';
import { constants } from '../constants';

export const onRedirectWallaForm = () => Linking.openURL(constants.feedbackUrl);
