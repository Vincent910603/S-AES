public class yh {
    public yh() {
    }

    public static String huo(String str1, String str2) {
        String temp = "";

        for(int i = 0; i < str1.length(); ++i) {
            if (str1.substring(i, i + 1).equals(str2.substring(i, i + 1))) {
                temp = temp + "0";
            } else {
                temp = temp + "1";
            }
        }

        return temp;
    }
}

