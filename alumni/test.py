from main import get_contacts_list

def test_get_contacts():
    contacts = get_contacts_list(query="software engineer biotech", limit=3)
    
    print(contacts)
    
def main():
    test_get_contacts()
    
if __name__ == "__main__":
    main()