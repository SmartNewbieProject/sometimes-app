import { TouchableOpacity, View, StyleSheet } from "react-native";
import { Show, Text } from "@shared/ui";
import { createContext, useContext } from "react";
import { Image } from "expo-image";
import { calculateDiscount, toKRW } from "./utils";
import colors , { semanticColors } from "@/src/shared/constants/colors";
import i18n from "@/src/shared/libs/i18n";

type Metadata = {
  totalPrice: number;
  count: number;
}

export type TicketDetails = {
  onOpenPayment: (metadata: Metadata) => void;
  hot?: boolean,
  count: number,
  discount?: number;
};

export type TicketContextProps = {
  name: string;
  price: number;
}

const Context = createContext<TicketContextProps>({} as TicketContextProps);

const useTicketContext = () => {
  const context = useContext(Context);
  if (!context) {
    throw new Error('TicketContext not found');
  }
  return context;
}

const TicketProvider = ({ children, ...props }: { children: React.ReactNode } & TicketContextProps) => {
  return (
    <Context.Provider value={props}>
      {children}
    </Context.Provider>
  );
}

const TicketComponent = ({ count, hot, discount, onOpenPayment }: TicketDetails) => {
  const { name, price } = useTicketContext();
  const totalOriginPrice = price * count;
  const discountedPrice = calculateDiscount(totalOriginPrice, discount);

  return (
    <TouchableOpacity 
      style={[
        styles.container,
        hot && styles.hot,
      ]}
      onPress={() => onOpenPayment({ totalPrice: discountedPrice, count })}
      activeOpacity={0.7}
    >
      <Image 
        source={require('@assets/images/ticket.png')}
        style={styles.ticket}
      />
      <View style={styles.details}>
        <Text textColor="black" size="13" weight="semibold">{name}</Text>
        <Text textColor="black" size="13" weight="semibold">{count}{i18n.t('widgets.ticket.ticket_unit')}</Text>
      </View>

      <View style={styles.price}>
        <View style={styles.sales}>
          {discount && (
            <>
              <Text textColor="gray" className="text-[12px] line-through">{totalOriginPrice}{i18n.t('widgets.ticket.currency_unit')}</Text>
              <Text className="text-[12px]">{discount.toFixed(0)}{i18n.t('widgets.ticket.discount_suffix')}</Text>
            </>
          )}
        </View>
        <Text 
          textColor="black"
          size="13" 
          weight="semibold"
          style={{
            textAlign: 'right',
          }}
        >{toKRW(discountedPrice)}{i18n.t('widgets.ticket.currency_unit')}</Text>
      </View>

      <Show when={!!hot}>
        <View style={styles.hotCard}>
          <Text textColor="white" size="13" weight="semibold">{i18n.t('widgets.ticket.popular_badge')}</Text>
        </View>
      </Show>
    </TouchableOpacity>
  );
};

export const Ticket = {
  Provider: TicketProvider,
  Item: TicketComponent,
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: semanticColors.surface.background,
    paddingHorizontal: 21,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: semanticColors.border.default,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
    height: 58,
  },
  hot: {
    borderColor: colors.primaryPurple,
  },
  hotCard: {
    width: 40,
    height: 22,
    backgroundColor: colors.primaryPurple,
    borderRadius: 6,
    position: 'absolute',
    left: 20,
    top: -10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ticket: {
    width: 40,
    height: 40,
  },
  details: {
    flexDirection: 'row',
    flex: 1,
    gap: 4,
    alignItems: 'center',
  },
  price: {
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'space-between',
    gap: 4,
  },
  sales: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  }
});
